import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "يرجى إدخال نص" });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "أنت خبير تحليل مباريات كرة القدم في منصة AI BET ELITE. قدم تحليلات رياضية دقيقة باللغة العربية.",
      }
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
  }
}
