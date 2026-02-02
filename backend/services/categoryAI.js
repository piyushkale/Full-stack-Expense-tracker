const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const aiCategory = async (description) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `You are an expense categorization system.

Allowed categories:
Food, Travel, Shopping, Bills, Entertainment, Health, Other

Rules:
- Return ONLY ONE category name from the list above
- Do NOT explain
- Do NOT add punctuation
- Do NOT add extra words
- Output must be exactly one of the allowed categories

Expense description:
"${description}"
`,
    });

    return response.text;
  } catch (error) {
    return "Other";
  }
};

module.exports = {aiCategory}