import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-c31a62f1/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check environment variables
app.get("/make-server-c31a62f1/debug", (c) => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  return c.json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "not set"
  });
});

// Gemini AI chat endpoint
app.post("/make-server-c31a62f1/chat", async (c) => {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      console.log("Error: GEMINI_API_KEY not configured");
      return c.json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY to environment variables." }, 500);
    }

    const body = await c.req.json();
    const { message, persona, conversationHistory, mood, language } = body;

    if (!message || !persona) {
      return c.json({ error: "Missing required fields: message and persona" }, 400);
    }

    // Build system prompt
    const mbtiText = persona.mbti ? ` Your MBTI personality type is ${persona.mbti}.` : '';
    let moodContext = '';
    if (mood !== undefined) {
      if (mood < 20) {
        moodContext = ' The user is feeling quite down today. Be extra empathetic and supportive. If they seem to be in crisis, gently suggest professional help.';
      } else if (mood < 40) {
        moodContext = ' The user is not feeling great. Listen carefully and provide compassionate support.';
      } else if (mood < 60) {
        moodContext = ' The user is feeling okay. Engage in supportive conversation.';
      } else if (mood < 80) {
        moodContext = ' The user is feeling good. Be positive and encouraging.';
      } else {
        moodContext = ' The user is feeling great! Match their positive energy.';
      }
    }

    const languageInstruction = language ? ` IMPORTANT: You MUST respond in ${language}. All your responses should be in ${language} language.` : '';

    const systemInstruction = `You are ${persona.name}, an AI counselor. ${persona.description}${mbtiText}${moodContext}${languageInstruction}

Important guidelines:
- Provide empathetic, supportive responses
- Ask open-ended questions to encourage the user to share more
- Never provide medical diagnoses or prescriptions
- If the user seems to be in crisis, gently encourage them to seek professional help
- Keep responses conversational and natural
- Be respectful of the user's feelings and experiences`;

    // Build conversation history
    const contents = [];

    // Add system instruction as first user message
    contents.push({
      role: "user",
      parts: [{ text: systemInstruction }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I will act as the counselor you described." }]
    });

    // Add conversation history (skip the initial greeting)
    if (conversationHistory && conversationHistory.length > 1) {
      for (let i = 1; i < conversationHistory.length; i++) {
        const msg = conversationHistory[i];
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Try different API versions and model names
    const apiConfigs = [
      { version: 'v1beta', model: 'gemini-2.5-flash' },
      { version: 'v1', model: 'gemini-2.5-flash' },
      { version: 'v1beta', model: 'gemini-1.5-flash' },
      { version: 'v1', model: 'gemini-1.5-flash' },
      { version: 'v1beta', model: 'gemini-pro' },
      { version: 'v1', model: 'gemini-pro' }
    ];

    let geminiResponse;
    let lastError;

    // Try each configuration until one works
    for (const config of apiConfigs) {
      try {
        const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${apiKey}`;
        console.log(`Trying ${config.version}/${config.model}`);

        geminiResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (geminiResponse.ok) {
          console.log(`✓ Successfully used ${config.version}/${config.model}`);
          break;
        }

        const errorText = await geminiResponse.text();
        console.log(`✗ Failed ${config.version}/${config.model}: ${errorText}`);
        lastError = { status: geminiResponse.status, text: errorText, config };
      } catch (error) {
        console.log(`✗ Exception ${config.version}/${config.model}: ${error.message}`);
        lastError = { error: error.message, config };
      }
    }

    if (!geminiResponse || !geminiResponse.ok) {
      console.log(`All Gemini API configurations failed. Last error:`, lastError);
      return c.json({
        error: `All Gemini API configurations failed`,
        lastError: lastError,
        triedConfigs: apiConfigs,
        apiKeyPresent: !!apiKey,
        suggestion: "Please verify your Gemini API key at https://aistudio.google.com/app/apikey and ensure it has access to Gemini models"
      }, 500);
    }

    const data = await geminiResponse.json();

    if (!data.candidates || data.candidates.length === 0) {
      console.log("No response from Gemini API");
      return c.json({ error: "No response from Gemini API" }, 500);
    }

    const responseText = data.candidates[0].content.parts[0].text;

    return c.json({
      response: responseText,
      success: true
    });

  } catch (error) {
    console.log(`Error in chat endpoint: ${error}`);
    return c.json({
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, 500);
  }
});

Deno.serve(app.fetch);