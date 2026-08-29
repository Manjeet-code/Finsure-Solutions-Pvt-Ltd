import Groq from 'groq-sdk';

// Intelligent domain-aware fallback assistant for FinSure Financial Services
const generateFallbackReply = (userQuery) => {
  const q = userQuery.toLowerCase();

  if (q.includes('personal loan') || q.includes('personal')) {
    return `### 💳 FinSure Personal Loan Highlights
• **Loan Amount**: Up to ₹10,000,000 (10 Lakhs)
• **Interest Rate**: Starting from 10.5% p.a.
• **Tenure**: 12 to 60 Months
• **Required Documents**: PAN Card, Aadhaar Card, Last 3 months Salary Slips, 6 months Bank Statement
• **Approval Time**: Fast digital verification within 24-48 hours.`;
  }

  if (q.includes('home loan') || q.includes('house') || q.includes('property')) {
    return `### 🏡 FinSure Home Loan Highlights
• **Loan Amount**: Up to ₹5,000,000 (50 Lakhs)
• **Interest Rate**: Starting from 8.35% p.a.
• **Tenure**: Up to 240 Months (20 Years)
• **Required Documents**: Title Deed, Approved Building Plan, Income Proof, KYC Docs
• **Special Benefit**: Zero hidden charges & doorstep documentation service.`;
  }

  if (q.includes('business loan') || q.includes('business')) {
    return `### 🏢 FinSure Business Loan Highlights
• **Loan Amount**: Up to ₹20,000,000 (2 Crores)
• **Interest Rate**: Starting from 12.0% p.a.
• **Eligibility**: 2+ years GST registration & audited P&L statement
• **Required Documents**: GST Return, Business Registration Certificate, 12 months Bank Statement.`;
  }

  if (q.includes('car') || q.includes('vehicle') || q.includes('auto')) {
    return `### 🚗 FinSure Vehicle & Auto Loan
• **Loan Amount**: Up to ₹1,500,000 (15 Lakhs)
• **Interest Rate**: Starting from 9.25% p.a.
• **Tenure**: Up to 84 Months (7 Years)
• **Coverage**: Up to 90% on-road price financing for 2W & 4W vehicles.`;
  }

  if (q.includes('document') || q.includes('kyc') || q.includes('proof')) {
    return `### 📑 Required KYC & Income Documents
• **Identity Proof**: PAN Card, Aadhaar Card, Passport, or Voter ID
• **Address Proof**: Aadhaar, Utility Bills (Electricity/Gas), Rent Agreement
• **Income Proof**: 3 to 6 months Bank Statement, Salary Slips, Form 16, or ITR
• **Property/Vehicle**: Title deeds or dealer proforma invoice (if applicable).`;
  }

  if (q.includes('status') || q.includes('track') || q.includes('apply')) {
    return `### 🔍 How to Track Your Application Status
• **Step 1**: Log in to your Applicant Portal using your registered email.
• **Step 2**: Go to **My Applications** section from the dashboard.
• **Step 3**: View real-time status: \`Pending\`, \`Verified\`, \`Sanctioned\`, or \`Disbursed\`.
• **Step 4**: You will receive SMS & Email notifications on every status update.`;
  }

  if (q.includes('emi') || q.includes('calculator') || q.includes('repayment')) {
    return `### 🧮 EMI Calculation & Repayments
• **EMI Calculator**: Use our interactive **EMI Calculator** tool under Resources to estimate monthly installments.
• **Payment Gateway**: Pay upcoming EMIs online via UPI, Net Banking, or Debit Card.
• **Auto-Debit (NACH)**: Set up auto-debit for hassle-free timely repayments.`;
  }

  if (q.includes('contact') || q.includes('branch') || q.includes('helpline') || q.includes('phone') || q.includes('support')) {
    return `### 📞 Contact FinSure Customer Support
• **Toll-Free Helpline**: 1800 123 4567 (Mon - Sat, 9 AM - 7 PM)
• **Support Email**: support@finsure.in
• **Branch Locator**: Visit our **Branch Locator** page to find the nearest branch near your pincode.`;
  }

  return `### 🤖 FinSure Financial Assistant
I can assist you with:
• **Loan Products**: Personal, Home, Business & Vehicle Loans
• **Document Checklist**: Required KYC and Income documents
• **Application Status**: How to track & review your loan queue
• **EMI Calculator**: Estimating rates, tenure, and monthly payments
• **Branch Network**: Finding your nearest branch & contacting support

*Please feel free to ask any question related to our loans or financial services!*`;
};

export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages format' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

    // Check if GROQ_API_KEY is available
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        if (aiMessage) {
          return res.status(200).json({ reply: aiMessage });
        }
      } catch (groqErr) {
        console.warn('[ChatController] Groq API Call failed, switching to domain assistant fallback:', groqErr.message);
      }
    }

    // Fallback response when LLM key is absent or API fails
    const fallbackReply = generateFallbackReply(lastUserMessage);
    return res.status(200).json({ reply: fallbackReply });
  } catch (error) {
    console.error('[ChatController Error]:', error);
    const fallbackReply = generateFallbackReply('');
    return res.status(200).json({ reply: fallbackReply });
  }
};
