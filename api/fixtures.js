export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "FOOTBALL_API_KEY is missing in Vercel environment variables" });
  }

  try {
    const params = new URL(req.url, "https://local.invalid").searchParams;
    const fixtureId = params.get("id");
    const date = params.get("date");
    const from = params.get("from");
    const to = params.get("to");
    const live = params.get("live");
    const apiParams = new URLSearchParams();

    if (fixtureId) {
      apiParams.set("id", fixtureId);
    } else if (date) {
      apiParams.set("date", date);
    } else if (from || to) {
      if (from) apiParams.set("from", from);
      if (to) apiParams.set("to", to);
    } else if (live === "all" || live === "true" || live === "1" || !live) {
      apiParams.set("live", "all");
    } else {
      apiParams.set("date", new Date().toISOString().slice(0, 10));
    }

    const url = `https://v3.football.api-sports.io/fixtures?${apiParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "x-apisports-key": apiKey, "Accept": "application/json" }
    });
    const data = await response.json();

    if (!response.ok || (data.errors && Object.keys(data.errors).length)) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        error: "Football API request failed",
        details: data.errors || data.message || "Unknown API error"
      });
    }

    const fixtures = (data.response || []).map(item => ({
      fixture: {
        id: item.fixture?.id,
        date: item.fixture?.date,
        timestamp: item.fixture?.timestamp,
        status: {
          short: item.fixture?.status?.short,
          long: item.fixture?.status?.long,
          elapsed: item.fixture?.status?.elapsed,
          extra: item.fixture?.status?.extra
        },
        venue: item.fixture?.venue,
        referee: item.fixture?.referee
      },
      league: {
        id: item.league?.id,
        name: item.league?.name,
        country: item.league?.country,
        logo: item.league?.logo,
        season: item.league?.season,
        round: item.league?.round
      },
      teams: {
        home: { id: item.teams?.home?.id, name: item.teams?.home?.name, logo: item.teams?.home?.logo, winner: item.teams?.home?.winner },
        away: { id: item.teams?.away?.id, name: item.teams?.away?.name, logo: item.teams?.away?.logo, winner: item.teams?.away?.winner }
      },
      goals: { home: item.goals?.home, away: item.goals?.away },
      score: item.score,
      events: item.events,
      statistics: item.statistics
    }));

    res.setHeader("Cache-Control", fixtureId ? "s-maxage=15, stale-while-revalidate=15" : "s-maxage=30, stale-while-revalidate=30");
    return res.status(200).json({ success: true, count: fixtures.length, updatedAt: new Date().toISOString(), fixtures });
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch fixtures", details: error.message });
  }
}
