import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    throw "No Gemini Api key configured in the enviroment!";
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    async run(content: string) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([content]);

        return result.response.text();
    }
}

export default GeminiService;
