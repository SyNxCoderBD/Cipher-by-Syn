import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent crashes if GEMINI_API_KEY is not immediately provided
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Cryptanalyst Endpoint
app.post("/api/cryptanalyst", async (req, res) => {
  const { text, mode, prompt } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for analysis." });
  }

  try {
    const ai = getAiClient();
    
    let systemInstruction = "You are a professional cryptanalyst and cryptography historian. " +
      "You analyze ciphertexts, help decode them, and explain the mathematical and logical reasoning behind the decryption. " +
      "Provide clear, elegant, well-structured Markdown responses. ";

    let userPrompt = "";

    if (mode === "analyze") {
      userPrompt = `Analyze the following text. Determine if it contains patterns, is a known cipher (such as Caesar, Vigenère, Substitution, Base64, etc.), or is simply standard English. If you detect a shift cipher, identify the potential shift. Provide history, entropy analysis, or interesting facts about the suspected cipher type if applicable.\n\nText to analyze:\n"""\n${text}\n"""`;
    } else if (mode === "decrypt") {
      userPrompt = `Attempt to decrypt or decode the following ciphertext. Use your advanced logical reasoning to solve it. " +
        "Perform statistical analysis, frequency analysis, or brute-force shift testing to find the correct translation. " +
        "Provide both the decrypted text clearly and a detailed step-by-step logical explanation of how you decrypted it.\n\nCiphertext:\n"""\n${text}\n"""`;
    } else if (mode === "custom") {
      userPrompt = `${prompt || "Analyze this cryptographic text."}\n\nTarget Text:\n"""\n${text}\n"""`;
    } else {
      userPrompt = `Analyze this text for any cryptographic properties:\n"""\n${text}\n"""`;
    }

    // Call the high thinking model gemini-3.1-pro-preview as specified in instructions
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
        // DO NOT set maxOutputTokens for thinking models
      },
    });

    res.json({
      result: response.text,
    });
  } catch (error: any) {
    console.error("Cryptanalyst API Error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during analysis. Make sure the Gemini API key is configured.",
    });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Configure Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
