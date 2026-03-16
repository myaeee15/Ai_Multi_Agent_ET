# AI Nexus - API Keys Configuration Guide

AI Nexus connects to multiple AI services through Supabase Edge Functions. To activate the real AI agents, you need to configure API keys as Supabase secrets.

## Quick Start

Configure the required API keys in your Supabase project dashboard:

### 1. OpenAI API Key
**Required for:** Language Agent, Coding Agent, Presentation Agent

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. In your Supabase Dashboard:
   - Go to Settings → Edge Functions → Secrets
   - Add secret: `OPENAI_API_KEY`
   - Paste your OpenAI API key

### 2. Google Gemini API Key
**Required for:** Vision Agent (image analysis)

1. Go to https://aistudio.google.com/app/apikeys
2. Create a new API key
3. In your Supabase Dashboard:
   - Go to Settings → Edge Functions → Secrets
   - Add secret: `GOOGLE_GEMINI_KEY`
   - Paste your Google Gemini API key

### 3. Anthropic API Key
**Required for:** Research Agent (deep analysis with citations)

1. Go to https://console.anthropic.com/account/keys
2. Create a new API key
3. In your Supabase Dashboard:
   - Go to Settings → Edge Functions → Secrets
   - Add secret: `ANTHROPIC_API_KEY`
   - Paste your Anthropic API key

## Architecture Overview

```
User Prompt
    ↓
Frontend (React)
    ↓
Edge Function: /ai-agents
    ├→ OpenAI GPT-4 (Language Agent)
    ├→ Google Gemini Vision (Vision Agent)
    ├→ Anthropic Claude (Research Agent)
    ├→ OpenAI GPT-4 (Coding Agent)
    └→ OpenAI GPT-4 (Presentation Agent)
    ↓
All responses returned in parallel
    ↓
Frontend displays agent cards with responses
```

## Edge Function Details

**Endpoint:** `/functions/v1/ai-agents`

**Method:** POST

**Headers:**
- `Authorization: Bearer {SUPABASE_ANON_KEY}`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "prompt": "Your question here",
  "imageUrl": "data:image/jpeg;base64,..." // Optional for Vision Agent
}
```

**Response:**
```json
{
  "responses": [
    {
      "agentType": "language",
      "response": "Agent's response text",
      "tokensUsed": 450,
      "responseTime": 1200
    },
    // ... more agent responses
  ]
}
```

## Agent Capabilities

### Language Agent (OpenAI GPT-4)
- General conversation and Q&A
- Writing assistance
- Code explanation
- Analysis and reasoning

### Vision Agent (Google Gemini Vision)
- Image analysis and description
- Object detection
- Text extraction (OCR)
- Scene understanding
- Composition analysis

### Research Agent (Anthropic Claude)
- Deep research and analysis
- Structured summaries
- Step-by-step breakdowns
- Citation formatting

### Coding Agent (OpenAI GPT-4)
- Code generation
- Debugging assistance
- Algorithm explanation
- Software architecture advice

### Presentation Agent (OpenAI GPT-4)
- Structured presentation creation
- Slide outline generation
- Talk point development
- Content organization

## Troubleshooting

### "API key not configured" Error
- Ensure you've added the secret to Supabase Edge Function Secrets
- Wait a few minutes for the secret to propagate
- Clear browser cache and reload

### No responses from agents
1. Check that all required API keys are configured
2. Verify your API keys have remaining quota/credits
3. Check browser console for detailed error messages
4. Ensure the edge function is deployed (check Supabase Dashboard)

### Slow responses
- Vision Agent may take longer due to image processing
- Research Agent uses a larger model and takes more time
- This is normal behavior - responses are processed in parallel

### Image upload not working with Vision Agent
- Ensure the image file is in a supported format (JPEG, PNG, WebP)
- Check that the image size is reasonable (< 20MB recommended)
- The Vision Agent will prompt you if no image is provided

## Rate Limits

Each API service has its own rate limits:
- **OpenAI:** Typically 3,500 requests/minute for GPT-4
- **Google Gemini:** Typically 60 requests/minute (free tier)
- **Anthropic Claude:** Typically 50 requests/minute (free tier)

Adjust based on your plan tier and usage needs.

## Cost Estimation

Rough cost per request (varies by tier):
- **Language Agent:** $0.03 - $0.12 (OpenAI)
- **Vision Agent:** $0.01 - $0.03 (Google Gemini)
- **Research Agent:** $0.01 - $0.04 (Anthropic)
- **Coding Agent:** $0.03 - $0.12 (OpenAI)
- **Presentation Agent:** $0.03 - $0.12 (OpenAI)

**Total per request with all agents:** ~$0.11 - $0.43

## Security Notes

- API keys are stored securely in Supabase Edge Function Secrets
- Keys are never exposed to the frontend
- All requests go through authenticated Edge Functions
- Row Level Security (RLS) protects user data in the database

## Environment Variables

Local development `.env` file (for reference only):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These are for frontend access only. Backend secrets are managed through Supabase Dashboard.
