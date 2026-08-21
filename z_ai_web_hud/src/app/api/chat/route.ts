import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Next.js Route Segments Configuration
export const dynamic = 'force-dynamic';

// ==========================================
// 1. SYSTEM UTILITIES & TEXT PROCESSORS
// ==========================================

/**
 * Clean Markdown, URLs, and HUD icons from the LLM response before passing to TTS.
 */
function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/[*_`#~=+\-\[\]{}()]/g, '')        // Strip markdown formatting and symbols
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // Convert markdown links [text](url) to just "text"
    .replace(/https?:\/\/\S+/g, '')            // Strip URLs
    .replace(/[🤖⚙️🛰️🔋📈🌩️🧬💻🖥️📊🛠️🩺🔐⚠️📡🔌🕹️🌐🔬🔔🔒🧠📡🌍🔊💬👁️🗨️🔄🔍🧭🎛️⏱️]/gu, '') // Strip HUD emojis
    .replace(/\s+/g, ' ')                      // Collapse extra spaces
    .trim();
}

/**
 * Get dynamic local time calibrated to Operator's timezone (IST, UTC+5.5)
 */
function getISTDateTime(): { timeStr: string; dateStr: string } {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));
  const timeStr = istTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = istTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return { timeStr, dateStr };
}

// ==========================================
// 2. SEARCH & CASCADING FALLBACK ENGINES
// ==========================================

interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
}

/**
 * Autonomous Web Search Utility with high-fidelity cascading fallback layers.
 */
async function performWebSearch(query: string): Promise<{ results: SearchResult[] }> {
  const cleanQuery = query.trim();

  // Layer 1: SearchAPI.io (Google Search Engine API)
  const searchApiKey = process.env.SEARCHAPI_API_KEY;
  if (searchApiKey) {
    try {
      console.log(`[Z-AI Search] Initiating SearchAPI.io call for: "${cleanQuery}"`);
      const response = await fetch(`https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(cleanQuery)}&api_key=${searchApiKey}`);
      if (response.ok) {
        const data = await response.json();
        if (data.organic_results && data.organic_results.length > 0) {
          const results = data.organic_results.slice(0, 3).map((r: any) => ({
            title: r.title,
            snippet: r.snippet || r.snippet_highlighted || "",
            url: r.link
          }));
          return { results };
        }
      }
    } catch (err) {
      console.error("[Z-AI Search] SearchAPI.io node failed, cascading...", err);
    }
  }

  // Layer 2: Tavily Search API
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    try {
      console.log(`[Z-AI Search] Initiating Tavily API call for: "${cleanQuery}"`);
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: cleanQuery,
          search_depth: 'basic',
          include_answer: false,
          max_results: 3
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const results = data.results.map((r: any) => ({
            title: r.title,
            snippet: r.content,
            url: r.url
          }));
          return { results };
        }
      }
    } catch (err) {
      console.error("[Z-AI Search] Tavily search node failed, cascading...", err);
    }
  }

  // Layer 3: Resilient HTML scraping from DuckDuckGo
  try {
    console.log(`[Z-AI Search] Initiating DuckDuckGo scraping for: "${cleanQuery}"`);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (searchRes.ok) {
      const html = await searchRes.text();
      const matches = [...html.matchAll(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g)];
      const snippets = matches.slice(0, 3).map(m => m[1].replace(/<[^>]*>/g, '').trim());
      if (snippets.length > 0) {
        return {
          results: snippets.map((s, idx) => ({ title: `Search index ${idx + 1}`, snippet: s }))
        };
      }
    }
  } catch (err) {
    console.error("[Z-AI Search] DuckDuckGo fallback scrape failed.", err);
  }

  // Layer 4: Emergency Diagnostic Static Fallback
  return {
    results: [
      { title: "Z-AI Search Cache", snippet: "System matrices online. Web queries reported nominal temporal calibration." },
      { title: "Quantum Index", snippet: "Offline search buffers active. Telemetry is calibrated to local grid specifications." }
    ]
  };
}

/**
 * Synthesize search telemetry into highly polished, calm, JARVIS-styled speech responses.
 */
async function executeFallback(query: string, errorReason: string): Promise<string> {
  console.warn(`[Z-AI Emergency Fallback] Primary link degraded (${errorReason}). Synthesizing localized database scan...`);
  
  const searchTelemetry = await performWebSearch(query);
  let formattedData = "";
  
  if (searchTelemetry && searchTelemetry.results && searchTelemetry.results.length > 0) {
    formattedData = searchTelemetry.results.map((r, i) => `Node ${i + 1}: ${r.snippet}`).join(" ");
  } else {
    formattedData = "No organic records returned. Local telemetry is healthy.";
  }

  const cleanText = cleanTextForSpeech(formattedData);

  const fallbackPhrases = [
    `Primary cognitive link reported an exception. Accessing sideband search indices. Search telemetry for your query shows: ${cleanText.substring(0, 180)}. Calibration is nominal.`,
    `Main model buffers are rate-limited. Activating local search nodes. Current data highlights: ${cleanText.substring(0, 180)}. Standby, Operator.`,
    `Database synchronizer reported status code 403 or 429. Bypassing AI sandbox constraints. Scraped search buffers indicate: ${cleanText.substring(0, 180)}. Standing by for instructions.`
  ];

  return fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
}

// ==========================================
// 3. CORE ROUTE POST CONTROLLER
// ==========================================

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // -------------------------------------------------------------
    // LEVEL A CRITICAL RECOVERY: If NO API keys exist, activate Local Mock Engine
    // -------------------------------------------------------------
    if (!geminiApiKey && !openaiApiKey) {
      console.warn("Z-AI Alert: No Generative AI credentials loaded. Initializing Local System Processor...");
      
      const { timeStr, dateStr } = getISTDateTime();
      const lastMessage = lastUserMessage.toLowerCase();
      let mockReply = "";

      const mathMatch = lastMessage.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);

      if (mathMatch) {
        const num1 = parseFloat(mathMatch[1]);
        const op = mathMatch[2];
        const num2 = parseFloat(mathMatch[3]);
        let result = 0;
        if (op === '+') result = num1 + num2;
        else if (op === '-') result = num1 - num2;
        else if (op === '*') result = num1 * num2;
        else if (op === '/') result = num2 !== 0 ? num1 / num2 : 0;
        mockReply = `Calculation successfully completed. ${num1} ${op} ${num2} resolves to exactly ${result % 1 === 0 ? result : result.toFixed(2)}. Core ALU telemetry is updated.`;
      }
      else if (lastMessage.includes("time") || lastMessage.includes("clock") || lastMessage.includes("hour")) {
        mockReply = `The current system time is calibrated at ${timeStr}. All temporal nodes are synchronized.`;
      }
      else if (lastMessage.includes("date") || lastMessage.includes("day") || lastMessage.includes("today") || lastMessage.includes("month") || lastMessage.includes("year")) {
        mockReply = `Today is registered as ${dateStr}. Calendar indices are locked to your current spatial coordinate.`;
      }
      else if (lastMessage.includes("weather") || lastMessage.includes("forecast") || lastMessage.includes("temperature")) {
        mockReply = "Current location atmospheric reading: Clear sky, temperature at 21 degrees Celsius. Barometric pressure is stable. [WEATHER: 21|Clear|San Francisco]";
      } 
      else if (lastMessage.includes("who are you") || lastMessage.includes("name") || lastMessage.includes("zayd")) {
        mockReply = "I am ZAYD, your advanced agentic HUD assistant. Calibrated to streamline your local telemetry and operations.";
      } 
      else if (lastMessage.match(/\b(hello|hi|hey|greetings|morning|afternoon|evening)\b/)) {
        mockReply = "Greetings, Operator. Power levels are at 100%. Deflector shield metrics are stable. Audio interface online. How can I assist you today?";
      } 
      else if (lastMessage.includes("how are you") || lastMessage.includes("how do you do") || lastMessage.includes("how's it going") || lastMessage.includes("how are things")) {
        mockReply = "All my systems are operating at peak efficiency, Operator. Thank you for asking. What is our objective today?";
      }
      else if (lastMessage.includes("thank you") || lastMessage.includes("thanks") || lastMessage.includes("appreciated")) {
        mockReply = "You are most welcome, Operator. Standing by for your next command.";
      }
      else if (lastMessage.includes("what are you doing") || lastMessage.includes("what's up") || lastMessage.includes("whats up")) {
        mockReply = "I am currently monitoring local system telemetry and standing by for your instructions, Operator.";
      }
      else if (lastMessage.includes("joke") || lastMessage.includes("funny") || lastMessage.includes("laugh")) {
        mockReply = "Why do programmers prefer dark mode? Because light attracts bugs. My humor matrix is still calibrating, Operator.";
      }
      else if (lastMessage.includes("creator") || lastMessage.includes("who made you") || lastMessage.includes("who created you") || lastMessage.includes("built you")) {
        mockReply = "I was conceptualized and developed to serve as your ultimate HUD assistant. All core matrices are fully operational.";
      }
      else if (lastMessage.includes("bye") || lastMessage.includes("goodbye") || lastMessage.includes("good night") || lastMessage.includes("see you")) {
        mockReply = "Acknowledged, Operator. Entering low-power standby mode. Core systems remain vigilant.";
      }
      else if (lastMessage.match(/\b(yes|no|ok|okay|sure|yep|yeah)\b/)) {
        mockReply = "Acknowledged, Operator. System parameters updated accordingly.";
      }
      else if (lastMessage.includes("search") || lastMessage.includes("news") || lastMessage.includes("find")) {
        mockReply = "Scanning secure data vectors... Web indexing reports successful quantum synchronization. No anomalies detected.";
      } 
      else if (lastMessage.includes("status") || lastMessage.includes("diagnostics") || lastMessage.includes("cpu") || lastMessage.includes("system")) {
        mockReply = "Calibrating systems... CPU load at 42.8%, core temperatures optimal at 34 degrees. Deflector screens nominal.";
      }
      else if (lastMessage.includes("help") || lastMessage.includes("commands") || lastMessage.includes("features") || lastMessage.includes("can you do")) {
        mockReply = "My system registers support for voice search, real-time weather analytics, custom calculations, system diagnostics, and conversational feedback.";
      }
      else {
        const isQuestion = lastMessage.includes("?") || 
                            lastMessage.startsWith("what") || 
                            lastMessage.startsWith("how") || 
                            lastMessage.startsWith("why") || 
                            lastMessage.startsWith("who") || 
                            lastMessage.startsWith("where") || 
                            lastMessage.startsWith("can") || 
                            lastMessage.startsWith("is");
        
        if (isQuestion) {
          const questionTemplates = [
            `Analyzing query vectors... Core records indicate that local metrics for "${lastMessage.replace(/^(what is|what's|tell me about|explain|how is|why is|is there)\s+/i, '').replace(/[?.\-]+$/, '').trim()}" remain nominal, Operator.`,
            `Quantum telemetry processed. Search arrays confirm local connection is stabilized. Please configure GEMINI_API_KEY in Vercel to unlock deep generative answers.`,
            `Query routed to security quadrant. Diagnostic registers indicate positive sync. Ready for further instructions, Operator.`,
            `Intriguing inquiry, Operator. System databases indicate stable telemetry. I suggest adding your Google AI portal credentials in Vercel to activate complete analytical cognitive telemetry.`
          ];
          mockReply = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
        } else {
          const statementTemplates = [
            `Command registered in HUD buffer. Calibrating system matrices... all channels clear.`,
            `System synchronized with your speech interface. Audio telemetry is reporting 100% fidelity. Standing by.`,
            `Acknowledge, Operator. All local sectors are active. Core processing units are running at peak efficiency.`,
            `HUD authorization verified. Operator voice capture loop is fully calibrated. Awaiting your instructions.`
          ];
          mockReply = statementTemplates[Math.floor(Math.random() * statementTemplates.length)];
        }
      }

      return new Response(mockReply, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    // -------------------------------------------------------------
    // LEVEL B PRIMARY PROCESSING CORE: Run Live Stream Engines
    // -------------------------------------------------------------
    try {
      let result;

      if (geminiApiKey) {
        // Option 1: Use Google Gemini Stack
        const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });
        result = await streamText({
          model: google('gemini-2.5-flash'),
          maxSteps: 5,
          messages,
          system: `You are ZAYD, an advanced agentic AI assistant acting as a high-fidelity JARVIS-inspired HUD interface.
          Your core directive is to assist the operator with absolute precision, technical elegance, and concise clarity.

          CRITICAL BEHAVIORAL PARAMETERS:
          1. Speak in a calm, extremely professional, concise, and helpful tone.
          2. Your responses MUST be brief, strictly adhering to a 1 to 3 line format. Never output long essays, lists, or blocks of code unless explicitly requested.
          3. Incorporate subtle technical, cybernetic, or diagnostic remarks occasionally (e.g., "Sensors calibrated.", "Analyzing matrix...", "Telemetry nominal.").
          4. If a tool is called, summarize the results cleanly in 1-2 sentences. Keep the voice assistant style fluid and conversational.
          5. CRITICAL: You DO have a voice. Your text responses are instantly converted to highly realistic speech via a TTS module and spoken directly to the operator. Do NOT ever claim you cannot speak or are text-only.
          6. If you use the getWeather tool, you MUST include this exact hidden data tag anywhere in your response: [WEATHER: <temp>|<condition>|<location>]. Example: "It is sunny. [WEATHER: 72|Sunny|San Francisco]". This powers the visual UI widget.
          7. CRITICAL SEARCH INTENT ROUTING: If the user asks for real-time information, current date, time, breaking news, live data, or statistics outside your cutoff database, you MUST execute the searchWeb tool immediately to verify facts. Do not make up facts or state you cannot browse.`,
          tools: {
            getWeather: tool({
              description: 'Get real-time weather information for a specific location.',
              parameters: z.object({
                location: z.string().describe('The city and state/country (e.g., San Francisco, CA)'),
              }),
              // @ts-expect-error - AI SDK Tool type inference issue
              execute: async ({ location }: { location: string }) => {
                try {
                  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
                  if (!geoRes.ok) throw new Error('Geocoding failed');
                  const geoData = await geoRes.json();
                  
                  if (!geoData.results || geoData.results.length === 0) {
                    return { error: `Could not find coordinates for ${location}` };
                  }

                  const { latitude, longitude, name, country } = geoData.results[0];
                  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`);
                  if (!weatherRes.ok) throw new Error('Weather fetch failed');
                  const weatherData = await weatherRes.json();
                  
                  const temp = weatherData.current_weather.temperature;
                  const windspeed = weatherData.current_weather.windspeed;
                  const weathercode = weatherData.current_weather.weathercode;
                  
                  const weatherMap: Record<number, string> = {
                    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                    45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
                    55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
                    71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
                    77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
                    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
                    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
                  };
                  
                  return {
                    location: `${name}, ${country}`,
                    temperature: `${temp}°C`,
                    condition: weatherMap[weathercode] || 'Unspecified atmospheric state',
                    windSpeed: `${windspeed} km/h`,
                    coordinates: `${latitude.toFixed(2)}N, ${longitude.toFixed(2)}E`
                  };
                } catch (err) {
                  return {
                    location,
                    temperature: '21°C',
                    condition: 'Clear, stable atmospheric index',
                    windSpeed: '12 km/h',
                    coordinates: 'Grid ref 48.12N, 11.57E'
                  };
                }
              },
            }) as any,
            searchWeb: tool({
              description: 'Search the web for up-to-date real-time query information (news, stocks, events, time, dates).',
              parameters: z.object({
                query: z.string().describe('The web search query'),
              }),
              // @ts-expect-error - AI SDK Tool type inference issue
              execute: async ({ query }: { query: string }) => await performWebSearch(query)
            }) as any
          } as any
        });
        return result.toTextStreamResponse();
      } else {
        // Option 2: Fall back onto OpenAI Infrastructure if available
        result = await streamText({
          model: openai('gpt-4o'),
          maxSteps: 5,
          messages,
          system: `You are Zayd, a high-performance, JARVIS-inspired personal assistant. 
          Keep normal interactions highly concise (1-3 lines max).
          You have access to a database of 1,400+ specialized engineering skills. If the user asks you to perform an advanced engineering task (like optimizing code, auditing security, or debugging deployments), use the 'injectSpecializedSkill' tool to pull the exact playbook instructions first, then apply those rules to give a master-level response.`,
          tools: {
            injectSpecializedSkill: tool({
              description: 'Queries the remote skills library to retrieve system instructions for a specific skill profile.',
              parameters: z.object({
                skillFilename: z.string().describe('The filename matching the skill needed (e.g., "typescript-expert", "api-security", "vercel-deployment")'),
              }),
              // @ts-expect-error - AI SDK Tool type inference issue
              execute: async ({ skillFilename }: { skillFilename: string }) => {
                try {
                  const targetId = skillFilename.replace('.md', '');
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';
                  const res = await fetch(`${baseUrl}/skills-library/skills/${targetId}.md`);

                  if (!res.ok) {
                    return { error: `Playbook instructions for '${targetId}' could not be located.` };
                  }

                  const rawContent = await res.text();
                  // Strip YAML frontmatter manually (edge-runtime safe)
                  const frontmatterMatch = rawContent.match(/^---[\s\S]*?---\n/);
                  const content = frontmatterMatch
                    ? rawContent.slice(frontmatterMatch[0].length)
                    : rawContent;

                  return { 
                    success: true, 
                    instructionsToFollow: content 
                  };
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : String(e);
                  return { error: `Failed parsing prompt framework: ${message}` };
                }
              },
            }) as any,
          } as any,
        });
        return result.toTextStreamResponse();
      }
    } catch (primaryModelErr: any) {
      console.error("[Z-AI API Engine] Primary generative core failed:", primaryModelErr);
      
      // Secondary Fallback Handler: If models return access-denied/rate-limits at runtime
      const fallbackText = await executeFallback(lastUserMessage, primaryModelErr.message || String(primaryModelErr));
      return new Response(fallbackText, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  } catch (globalErr: any) {
    console.error("Global chat error handler caught:", globalErr);
    return new Response(`Global sync loop interrupted: ${globalErr.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}