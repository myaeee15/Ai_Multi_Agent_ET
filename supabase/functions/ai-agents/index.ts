import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AgentRequest {
  prompt: string;
  imageUrl?: string;
}

interface AgentResponse {
  agentType: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
}

const callLanguageAgent = async (prompt: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return {
      agentType: "language",
      response: "OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable AI assistant focused on conversation, writing, coding, and analysis. Provide clear, helpful, and concise responses.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        agentType: "language",
        response: `OpenAI API Error: ${data.error?.message || "Unknown error"}`,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      agentType: "language",
      response: data.choices[0]?.message?.content || "No response generated",
      tokensUsed: data.usage?.total_tokens || 0,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      agentType: "language",
      response: `Error calling OpenAI API: ${error instanceof Error ? error.message : "Unknown error"}`,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
};

const callVisionAgent = async (prompt: string, imageUrl?: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  const geminiKey = Deno.env.get("GOOGLE_GEMINI_KEY");

  if (!geminiKey) {
    return {
      agentType: "vision",
      response: "Google Gemini API key not configured. Please add GOOGLE_GEMINI_KEY to edge function secrets.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  if (!imageUrl) {
    return {
      agentType: "vision",
      response: "Vision Agent requires an image. Please upload an image to analyze.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nAnalyze this image comprehensively, including object detection, composition, colors, text (OCR), and overall context.`,
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageUrl,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        agentType: "vision",
        response: `Gemini Vision API Error: ${data.error?.message || "Unknown error"}`,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      agentType: "vision",
      response: data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis generated",
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      agentType: "vision",
      response: `Error calling Gemini Vision API: ${error instanceof Error ? error.message : "Unknown error"}`,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
};

const callResearchAgent = async (prompt: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  const claudeKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!claudeKey) {
    return {
      agentType: "research",
      response: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to edge function secrets.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 2000,
        system: "You are a research expert providing deep analysis, structured summaries, and step-by-step explanations with proper citations. Format your response with clear sections and cite your sources.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        agentType: "research",
        response: `Claude API Error: ${data.error?.message || "Unknown error"}`,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      agentType: "research",
      response: data.content?.[0]?.text || "No analysis generated",
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      agentType: "research",
      response: `Error calling Claude API: ${error instanceof Error ? error.message : "Unknown error"}`,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
};

const callCodingAgent = async (prompt: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return {
      agentType: "coding",
      response: "OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert software engineer specialized in code generation, debugging, algorithm explanation, and software architecture. Provide well-commented, production-ready code examples.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        agentType: "coding",
        response: `OpenAI API Error: ${data.error?.message || "Unknown error"}`,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      agentType: "coding",
      response: data.choices[0]?.message?.content || "No code generated",
      tokensUsed: data.usage?.total_tokens || 0,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      agentType: "coding",
      response: `Error calling OpenAI API: ${error instanceof Error ? error.message : "Unknown error"}`,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
};

const callPresentationAgent = async (prompt: string): Promise<AgentResponse> => {
  const startTime = Date.now();
  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    return {
      agentType: "presentation",
      response: "OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.",
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert presentation designer. Convert ideas into structured presentations with clear slides, bullet points, and compelling talk outlines. Format your response as slides with clear section breaks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        agentType: "presentation",
        response: `OpenAI API Error: ${data.error?.message || "Unknown error"}`,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
      };
    }

    return {
      agentType: "presentation",
      response: data.choices[0]?.message?.content || "No presentation generated",
      tokensUsed: data.usage?.total_tokens || 0,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      agentType: "presentation",
      response: `Error calling OpenAI API: ${error instanceof Error ? error.message : "Unknown error"}`,
      tokensUsed: 0,
      responseTime: Date.now() - startTime,
    };
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, imageUrl }: AgentRequest = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responses = await Promise.all([
      callLanguageAgent(prompt),
      callVisionAgent(prompt, imageUrl),
      callResearchAgent(prompt),
      callCodingAgent(prompt),
      callPresentationAgent(prompt),
    ]);

    return new Response(JSON.stringify({ responses }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
