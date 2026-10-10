export default async function handler(req, res) {
  const { prompt } = req.body;
  
  // حط مفتاح الـ AIzaSy بتاعك هنا مباشرة بين علامتي التنصيص
  const apiKey = "AQ.AIzaSyCMXueXqJY6kooZ0kY2R2b3grGOdrjYK5w";

  if (!prompt) {
    return res.status(400).json({ error: "يرجى إدخال نص" });
  }

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
