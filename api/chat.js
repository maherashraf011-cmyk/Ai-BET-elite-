export default async function handler(req, res) {
  const { prompt } = req.body;
  
  // حط مفتاح الـ API بتاعك بين العلامتين دول بدلاً من الكلمة
  const apiKey = "aaeae301b2fc244feebec3726c4a730b";

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `أنت خبير تحليل مباريات كرة القدم في منصة AI BET ELITE. قدم تحليلات رياضية دقيقة باللغة العربية.\n\nسؤال المستخدم: ${prompt}` }] }]
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "تم استلام الطلب ولكن لا يوجد رد.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: `خطأ في الاتصال: ${error.message}` });
  }
}
