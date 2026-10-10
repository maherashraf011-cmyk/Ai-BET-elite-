export default async function handler(req, res) {
  const { prompt } = req.body;
  
  // حط مفتاح AI Studio بتاعك هنا (اللي بيبدأ بـ AIzaSy)
  const apiKey = "AIzaSyCMXueXqJY6kooZ0kY2R2b3grGOdrjYK5w";

  if (!prompt) {
    return res.status(400).json({ error: "يرجى إدخال نص" });
  }

  try {
    const apiResponse = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiResponse, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `أنت خبير تحليل مباريات كرة القدم وتحليلات رياضية دقيقة لمنصة AI BET ELITE. تحدث بالعامية المصرية وبشكل حماسي ورياضي دقيق.\n\nسؤال المستخدم: ${prompt}` 
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "تم الاستلام ولكن لم يتم توليد رد.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ reply: `خطأ في الاتصال: ${error.message}` });
  }
}
