
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "FOOTBALL_API_KEY is missing in Vercel"
    });
  }

  try {
    const url = "https://v3.football.api-sports.io/fixtures?live=all";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const data = await response.json();

    if (!response.ok || data.errors && Object.keys(data.errors).length) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        error: "Football API request failed",
        details: data.errors || data.message || "Unknown API error"
      });
    }

    const fixtures = (data.response || []).map(item => ({
      id: item.fixture.id,
      date: item.fixture.date,
      timestamp: item.fixture.timestamp,
      status: item.fixture.status.short,
      statusLong: item.fixture.status.long,
      elapsed: item.fixture.status.elapsed,
      league: item.league.name,
      country: item.league.country,
      leagueLogo: item.league.logo,
      home: {
        id: item.teams.home.id,
        name: item.teams.home.name,
        logo: item.teams.home.logo,
        winner: item.teams.home.winner
      },
      away: {
        id: item.teams.away.id,
        name: item.teams.away.name,
        logo: item.teams.away.logo,
        winner: item.teams.away.winner
      },
      goals: {
        home: item.goals.home,
        away: item.goals.away
      }
    }));

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");

    return res.status(200).json({
      success: true,
      count: fixtures.length,
      updatedAt: new Date().toISOString(),
      fixtures
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not fetch live fixtures",
      details: error.message
    });
  }
}
