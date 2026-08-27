import Groq from 'groq-sdk';

export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages format' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API Key is missing on the server' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // System prompt to enforce behavior
    const systemPrompt = {
      role: 'system',
      content: `You are Finsure AI, a professional and helpful financial assistant for 'Finsure Solutions Pvt Ltd'. 
Your job is to answer questions related to loans (personal, business, home, etc.) and insurance (life, health, etc.).
CRITICAL RULES:
1. Always format your responses using bullet points.
2. Keep your answers highly optimized, concise, and easy to read. Do not write long paragraphs.
3. If a user asks a question completely unrelated to finance, loans, insurance, or our company, politely decline to answer and remind them that you are a financial assistant.`
    };

    const apiMessages = [systemPrompt, ...messages];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content;

    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ message: 'Failed to process chat request' });
  }
};
