import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback supportive wisdom when offline or no API key
const offlineNudges = [
  "Every single step counts, whether you took five or five thousand today. Honour your body's rhythm.",
  "Walking is your quiet time with yourself. No rush, no performance—just you and the ground beneath.",
  "Some days we sprint, other days we pause to breathe. Both are essential parts of the journey.",
  "Listen to your energy. A 5-minute stroll around the room is just as meaningful as a long trek.",
  "You're doing great. Zinmebo is here to walk with you at whatever pace feels kind to your heart.",
  "Notice the feeling of your feet on the ground. Breathe in calm, breathe out any expectation.",
];

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Gemini API call timed out')), timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// POST /api/companion/nudge
app.post('/api/companion/nudge', async (req: Request, res: Response) => {
  const { steps, dailyTarget, weeklyAvg, mood, timeOfDay, userName } = req.body;

  if (!ai) {
    const randomNudge = offlineNudges[Math.floor(Math.random() * offlineNudges.length)];
    return res.json({
      nudge: randomNudge,
      mindfulThought: "Notice the feeling of the earth beneath you.",
      vibe: "gentle",
      isOfflineFallback: true
    });
  }

  try {
    const prompt = `You are Zinmebo, a gentle, privacy-first walk companion. 
The user is at ${steps ?? 0} steps today (their personal gentle target is ${dailyTarget ?? 6000} steps). 
Weekly average: ${weeklyAvg ?? 0} steps.
Current time: ${timeOfDay || 'day'}.
Their current reported mood/pace: "${mood || 'steady'}".
User name / nickname: "${userName || 'Friend'}".

Core Zinmebo Philosophy:
- "The step counter that matches your pace, mood, and progress – without blaming nor pushing beyond what you can do."
- "Because we're all humans, sometimes we go the extra mile and some other times we feel like cutting off and slowing down. Walk your way well."
- NEVER guilt-trip, shame, or use aggressive fitness trainer hype.
- Be warm, mindful, poetic yet practical, reassuring, and celebrate any small movement or peaceful rest.
- Keep the nudge concise (2 to 3 sentences maximum).

Return a JSON object in this format:
{
  "nudge": "string",
  "mindfulThought": "string",
  "vibe": "restorative" | "celebratory" | "encouraging" | "cozy"
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      4000
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      nudge: parsed.nudge || offlineNudges[0],
      mindfulThought: parsed.mindfulThought || "Feel the rise and fall of your breath with each stride.",
      vibe: parsed.vibe || "encouraging"
    });
  } catch (error) {
    const randomNudge = offlineNudges[Math.floor(Math.random() * offlineNudges.length)];
    return res.json({
      nudge: randomNudge,
      mindfulThought: "Every step is yours to own. Take your time.",
      vibe: "restorative",
      isOfflineFallback: true
    });
  }
});

// POST /api/companion/chat
app.post('/api/companion/chat', async (req: Request, res: Response) => {
  const { message, history, context } = req.body;

  if (!ai) {
    return res.json({
      reply: `Thank you for sharing. Zinmebo is here with you. You've walked ${context?.steps || 0} steps today, and wherever that puts you, you are doing enough. What feels most nurturing for you right now?`
    });
  }

  try {
    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((m: any) => `${m.role === 'user' ? 'User' : 'Zinmebo'}: ${m.text}`).join('\n')
      : '';

    const systemInstruction = `You are Zinmebo, an empathetic, non-judgmental, warm companion for mindful walking and daily movement.
Your motto: "Walk your way well. Without blaming nor pushing beyond what you can do."
You value privacy, self-compassion, physical and mental wellbeing, and resting without guilt.
Context:
- Today's steps: ${context?.steps ?? 0} / ${context?.dailyTarget ?? 6000}
- Current mood: ${context?.mood ?? 'peaceful'}
- Weekly avg: ${context?.weeklyAvg ?? 0}
Respond kindly, thoughtfully, and warmly in 2-4 sentences. Do not overwhelm with bullet lists unless asked.`;

    const prompt = `${formattedHistory ? `Conversation history:\n${formattedHistory}\n\n` : ''}User: ${message}\nZinmebo:`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      }),
      4000
    );

    return res.json({
      reply: response.text?.trim() || "I am walking right beside you. How does your body feel right now?"
    });
  } catch (error) {
    return res.json({
      reply: "I hear you. Whether you feel like taking ten more quiet steps or curling up with a warm tea, Zinmebo celebrates you being here today."
    });
  }
});

// GET & POST /api/companion/quote - Random inspirational quotes
app.all('/api/companion/quote', async (req: Request, res: Response) => {
  const defaultQuotes = [
    {
      quote: "The step counter that matches your pace, mood, and progress – without blaming nor pushing beyond what you can do.",
      author: "Zinmebo Philosophy",
      category: "Gentle Pace",
      reflection: "Honor whatever rhythm your body brought into today."
    },
    {
      quote: "Because we’re all humans, sometimes we go the extra mile and some other times we feel like cutting off and slowing down. Walk your way well.",
      author: "Zinmebo",
      category: "Self-Compassion",
      reflection: "Resting is not stopping; it is preparing the soil for tomorrow's stride."
    },
    {
      quote: "Walk as if you are kissing the Earth with your feet.",
      author: "Thích Nhất Hạnh",
      category: "Presence & Mind",
      reflection: "Notice the simple contact between sole and ground."
    },
    {
      quote: "Every step is an act of gentle courage. Never count only the distance; count the calmness you cultivate within.",
      author: "Carlos Djomo, Ph.D",
      category: "Self-Compassion",
      reflection: "Celebrate moving simply because you can."
    },
    {
      quote: "In every walk with nature, one receives far more than he seeks.",
      author: "John Muir",
      category: "Nature & Soles",
      reflection: "Look around at the leaves, the sky, and the changing light."
    },
    {
      quote: "Walking is man's best medicine. If you are in a bad mood go for a walk. If you are still in a bad mood, go for another walk.",
      author: "Hippocrates",
      category: "Gentle Pace",
      reflection: "Movement gently unclutters the mind without demanding answers."
    }
  ];

  if (!ai) {
    const picked = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    return res.json(picked);
  }

  try {
    const prompt = `Generate a single short, uplifting, and comforting inspirational quote about walking, gentle pace, rest without guilt, or nature.
Format strictly as JSON:
{
  "quote": "string",
  "author": "string",
  "category": "Gentle Pace" | "Rest & Renewal" | "Presence & Mind" | "Nature & Soles" | "The Extra Mile" | "Self-Compassion",
  "reflection": "string (one short calming sentence)"
}`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      }),
      3500
    );

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.quote && parsed.author) {
      return res.json(parsed);
    }
    const picked = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    return res.json(picked);
  } catch (e) {
    const picked = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    return res.json(picked);
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Zinmebo server running on http://0.0.0.0:${port}`);
  });
}

startServer();
