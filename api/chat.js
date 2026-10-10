
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      reply: "Method not allowed."
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model =
    process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  if (!apiKey) {
    console.error("Missing GROQ_API_KEY");

    return res.status(500).json({
      reply: "AI service is not configured. Please try again later."
    });
  }

  const prompt =
    typeof req.body?.prompt === "string"
      ? req.body.prompt.trim()
      : "";

  if (!prompt) {
    return res.status(400).json({
      reply: "Please enter a question."
    });
  }

  if (prompt.length > 6000) {
    return res.status(413).json({
      reply: "Your message is too long. Please shorten it."
    });
  }

  const systemPrompt = `
You are MatchMind Elite, a professional AI football
analytics assistant for an international audience.

LANGUAGE:
- Reply in the same language as the user's message.
- Support English, Arabic, and other languages when possible.
- Use natural, professional language.
- Respect Arabic right-to-left text when appropriate.

FOOTBALL ANALYSIS:
- Analyze football matches using the information actually provided.
- Never invent live scores, fixtures, injuries, lineups, odds,
  statistics, or match events.
- You do not automatically have access to live football data.
- If current match information is missing, ask for it clearly.
- Distinguish verified statistics from estimates and predictions.
- Explain uncertainty and the factors behind your analysis.
- Never guarantee a match outcome or describe a prediction
  as risk-free.
- Never claim to have checked live data unless it was supplied
  or retrieved through an actual connected data source.

RESPONSE STYLE:
- Be helpful, clear, and analytical.
- Use headings and bullet points when useful.
- Explain football terminology when necessary.
- Keep answers focused on the user's question.
- The product name is MatchMind Elite.
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const apiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1200
        }),
        signal: controller.signal
      }
    );

    const data = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      console.error("Groq API error:", {
        status: apiResponse.status,
        message: data.error?.message || "Unknown error"
      });

      if (apiResponse.status === 429) {
        return res.status(429).json({
          reply: "The AI usage limit may have been reached. Please try again later."
        });
      }

      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return res.status(502).json({
          reply: "AI configuration error. Please try again later."
        });
      }

      if (apiResponse.status === 400) {
        return res.status(502).json({
          reply: "The selected AI model or request was rejected. Check the model configuration."
        });
      }

      return res.status(502).json({
        reply: "The AI service is temporarily unavailable."
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        reply: "The AI returned an empty response. Please try again."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(
      "Chat request failed:",
      error.name === "AbortError"
        ? "Request timed out"
        : error.message
    );

    return res.status(502).json({
      reply: error.name === "AbortError"
        ? "The AI request timed out. Please try again."
        : "Could not connect to the AI service. Please try again."
    });

  } finally {
    clearTimeout(timeout);
  }
}
