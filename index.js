const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
// FIX: Use GoogleGenAI and import Type for response schema, as GoogleGenerativeAI is deprecated.
const { GoogleGenAI, Type } = require("@google/genai");

// FIX: API key must be retrieved from process.env.API_KEY per coding guidelines.
// IMPORTANT: Set your Gemini API Key in your Firebase environment as the 'API_KEY' secret.
// Run: firebase functions:secrets:set API_KEY
// The key will then be available as process.env.API_KEY.
const API_KEY = process.env.API_KEY;

const app = express();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(express.json());

// FIX: Use GoogleGenAI as GoogleGenerativeAI is deprecated.
const ai = new GoogleGenAI({apiKey: API_KEY});

// --- API Endpoint to Generate Story Text ---
app.post("/generateStory", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send({ error: "Prompt is required" });
    }
    
    // FIX: Added a response schema to ensure the model returns data in the correct JSON format.
    const storySchema = {
        type: Type.OBJECT,
        properties: {
            pages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        page: { type: Type.INTEGER },
                        text: { type: Type.STRING },
                    },
                    required: ["page", "text"],
                },
            },
        },
        required: ["pages"],
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: storySchema,
        }
    });

    // The response is a JSON string, so we parse it before sending
    const storyData = JSON.parse(response.text);
    res.status(200).send(storyData);

  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).send({ error: "Failed to generate story" });
  }
});

// --- API Endpoint to Generate Images ---
app.post("/generateImage", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send({ error: "Prompt is required" });
    }
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;

    res.status(200).send({ imageUrl: imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send({ error: "Failed to generate image" });
  }
});

// --- API Endpoint to Translate Text ---
app.post("/translate", async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).send({ error: "Text and target language are required" });
        }
        
        const prompt = `Translate the following Korean text to English. Only provide the translation.
        Korean text: "${text}"
        English translation:`;
        
        if (targetLang === 'ko') { // No translation needed if target is Korean
            return res.status(200).send({ translatedText: text });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.status(200).send({ translatedText: response.text.trim() });
    } catch (error) {
        console.error("Error translating text:", error);
        res.status(500).send({ error: "Failed to translate text" });
    }
});


// Expose Express API as a single Cloud Function
exports.api = functions.https.onRequest(app);
