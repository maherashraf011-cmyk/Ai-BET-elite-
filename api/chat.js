export default async function handler(req, res) {
  const { prompt } = req.body;
  
  // ضع المفتاح الجديد هنا بين علامتي التنصيص
  const apiKey = "AQ.Ab8RN6JANVNVQgXq8ZUzjjBcpf45UAOe3PNfhw8HZrmyQYtWvA";

  if (!prompt) {
    return res.status(400).json({ error: "يرجى إدخال نص" });
  }

  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
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
