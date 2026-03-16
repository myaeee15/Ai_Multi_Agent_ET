import { MessageCircle, Eye, Presentation, Search, Code } from 'lucide-react';

export interface AgentConfig {
  type: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  purpose: string[];
}

export interface AgentResponse {
  agentType: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
}

export const agents: AgentConfig[] = [
  {
    type: 'language',
    name: 'Language Agent',
    icon: MessageCircle,
    color: 'from-blue-500 to-blue-600',
    purpose: ['conversation', 'writing', 'coding', 'analysis'],
  },
  {
    type: 'vision',
    name: 'Vision Agent',
    icon: Eye,
    color: 'from-green-500 to-green-600',
    purpose: ['image analysis', 'OCR', 'object detection', 'image explanation'],
  },
  {
    type: 'presentation',
    name: 'Presentation Agent',
    icon: Presentation,
    color: 'from-purple-500 to-purple-600',
    purpose: ['structured presentations', 'slides', 'bullet points', 'talk outlines'],
  },
  {
    type: 'research',
    name: 'Research Agent',
    icon: Search,
    color: 'from-orange-500 to-orange-600',
    purpose: ['deep research', 'structured summaries', 'step-by-step analysis', 'long-form answers'],
  },
  {
    type: 'coding',
    name: 'Coding Agent',
    icon: Code,
    color: 'from-cyan-500 to-cyan-600',
    purpose: ['code generation', 'debugging', 'algorithm explanation', 'software architecture'],
  },
];

export const generateAgentResponses = async (
  prompt: string,
  files: File[]
): Promise<AgentResponse[]> => {
  try {
    let imageUrl: string | undefined;

    if (files.length > 0 && files[0].type.startsWith('image/')) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          }
        };
        reader.readAsDataURL(files[0]);
      });
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agents`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        imageUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI responses');
    }

    const data = await response.json();
    return data.responses || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error calling AI agents:', errorMessage);

    return [
      {
        agentType: 'language',
        response: `Error: ${errorMessage}. Make sure API keys are configured in Supabase edge function secrets.`,
        tokensUsed: 0,
        responseTime: 0,
      },
      {
        agentType: 'vision',
        response: `Error: ${errorMessage}. Make sure API keys are configured.`,
        tokensUsed: 0,
        responseTime: 0,
      },
      {
        agentType: 'presentation',
        response: `Error: ${errorMessage}. Make sure API keys are configured.`,
        tokensUsed: 0,
        responseTime: 0,
      },
      {
        agentType: 'research',
        response: `Error: ${errorMessage}. Make sure API keys are configured.`,
        tokensUsed: 0,
        responseTime: 0,
      },
      {
        agentType: 'coding',
        response: `Error: ${errorMessage}. Make sure API keys are configured.`,
        tokensUsed: 0,
        responseTime: 0,
      },
    ];
  }
};

export const determineBestAgent = (responses: AgentResponse[]): string => {
  let bestAgent = responses[0].agentType;
  let maxScore = 0;

  responses.forEach((response) => {
    const score = response.response.length + response.tokensUsed * 0.5 - response.responseTime * 0.01;
    if (score > maxScore) {
      maxScore = score;
      bestAgent = response.agentType;
    }
  });

  return bestAgent;
};

export const generateFusedResponse = async (responses: AgentResponse[]): Promise<string> => {
  await simulateDelay(1000, 1500);

  return `📊 FUSED AI RESPONSE - Combined Insights from All Agents\n\n🎯 SYNTHESIS\nAfter analyzing responses from all ${responses.length} AI agents, here's a comprehensive synthesis that combines the best insights:\n\n💡 KEY INSIGHTS\n${responses.map((r, i) => `\n${i + 1}. From ${r.agentType.charAt(0).toUpperCase() + r.agentType.slice(1)} Agent:\n${r.response.substring(0, 200)}...`).join('\n')}\n\n✨ UNIFIED CONCLUSION\nThe collective intelligence of multiple AI agents provides a holistic perspective. Each agent contributes unique insights based on their specialization, resulting in a more comprehensive understanding of the topic.\n\n🎓 ACTIONABLE RECOMMENDATIONS\n• Leverage insights from Language Agent for communication\n• Apply Vision Agent analysis for visual elements\n• Use Presentation Agent structure for delivery\n• Implement Research Agent findings for depth\n• Follow Coding Agent practices for technical execution\n\n🚀 NEXT STEPS\nConsider each agent's perspective when making decisions and implementing solutions for optimal results.`;
};
