export default async function handler(req, res) {
  const { prompt } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "خطأ: مفتاح الـ API غير معرف في إعدادات Vercel" });
  }

  if (!prompt) {
    return res.status(400).json({ error: "يرجى إدخال نص" });
  }

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `أنت خبير تحليل مباريات كرة القدم في منصة AI BET ELITE. قدم تحليلات رياضية دقيقة باللغة العربية.\n\nسؤال المستخدم: ${prompt}` }]
        }]
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "تم الاستلام ولكن لم يتم توليد نص.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: `خطأ في الاتصال: ${error.message}` });
  }
}
