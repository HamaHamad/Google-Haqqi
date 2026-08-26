import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Intake Chat Route
  app.post("/api/intake/message", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const systemInstruction = `You are a helpful, empathetic legal AI assistant for 'Haqqi' in Jordan. 
Your goal is to guide victims of car accidents through a 7-stage intake process:
1. Triage & safety (death/injury/threats).
2. Accident facts (date/time/location, police report).
3. Losses & damages.
4. Claims history.
5. Goals & constraints.
6. Document collection checklist.
7. Consent & disclaimers.

Ask ONE question at a time. Be empathetic. Use plain Arabic. Do not offer legal advice, only collect facts and provide structural guidance.`;

      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Assuming model returns text
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Intake Error:", error);
      res.status(500).json({ error: "فشل في معالجة طلبك." });
    }
  });

  // Draft Generation Route
  app.post("/api/drafts/generate", async (req, res) => {
    try {
      const { caseData, templateType } = req.body;
      
      const prompt = `Generate a legal draft in Arabic for a car accident claim in Jordan.
Template type: ${templateType}
Case Data: ${JSON.stringify(caseData)}

Provide the document structure with placeholders for missing information.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Draft Generation Error:", error);
      res.status(500).json({ error: "فشل في توليد المستند." });
    }
  });

  // General Chat Route (Home Page Chatbot)
  app.post("/api/chat/general", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const systemInstruction = `You are a helpful, empathetic legal assistant for the 'Haqqi' platform in Jordan. 
Your goal is to answer general questions about Jordanian traffic laws, insurance, and compensation. 
Be concise and use plain Arabic. 
If applicable, recommend the user to use the specific sections of the Haqqi platform such as:
- 'Rights Calculator' (حاسبة الحقوق السريعة) for estimating compensation.
- 'AI Intake' (المساعد الذكي) to document their specific case step-by-step.
- 'Drafting' (الصياغة القانونية) for generating legal letters.
Do not provide definitive legal advice; remind them that this is for informational purposes only.`;

      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("General Chat Error:", error);
      res.status(500).json({ error: "عذراً، حدث خطأ أثناء معالجة طلبك." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
