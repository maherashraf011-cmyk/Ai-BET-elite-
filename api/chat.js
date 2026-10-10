export default async function handler(req, res) {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'يرجى إدخال نص' });
  }

  res.status(200).json({ 
    reply: `محلل الـ AI استلم سؤالك: "${prompt}". جاري معالجة البيانات وتحديث النتائج فوراً.` 
  });
}
