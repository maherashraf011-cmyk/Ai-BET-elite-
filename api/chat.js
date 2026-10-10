export default async function handler(req, res) {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "خطأ: مفتاح API غير موجود في Environment Variables" });
  }

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt || "اختبار الاتصال" }] }]
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "تم الاستلام ولكن بدون نص";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: `خطأ في الاتصال: ${error.message}` });
  }
}
