import { useState } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Maximize2, Minimize2, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AgentCardProps {
  id: string;
  agentType: string;
  agentName: string;
  agentIcon: React.ComponentType<{ className?: string }>;
  agentColor: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
  rating: number;
  isBest: boolean;
  darkMode: boolean;
  onRatingChange: (id: string, rating: number) => void;
}

export default function AgentCard({
  id,
  agentType,
  agentName,
  agentIcon: Icon,
  agentColor,
  response,
  tokensUsed,
  responseTime,
  rating,
  isBest,
  darkMode,
  onRatingChange,
}: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRating = async (newRating: number) => {
    const ratingValue = rating === newRating ? 0 : newRating;
    onRatingChange(id, ratingValue);

    await supabase
      .from('agent_responses')
      .update({ rating: ratingValue })
      .eq('id', id);
  };

  return (
    <div
      className={`${
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
      } border rounded-2xl p-6 transition-all hover:shadow-lg ${
        isBest ? 'ring-2 ring-yellow-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-r ${agentColor} p-3 rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {agentName}
              </h3>
              {isBest && (
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-lg">
                  <Award className="w-3 h-3" />
                  <span className="text-xs font-medium">Best Response</span>
                </div>
              )}
            </div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {responseTime}ms • {tokensUsed} tokens
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRating(1)}
            className={`p-2 rounded-lg transition-all ${
              rating === 1
                ? 'bg-green-500 text-white'
                : darkMode
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRating(-1)}
            className={`p-2 rounded-lg transition-all ${
              rating === -1
                ? 'bg-red-500 text-white'
                : darkMode
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed mb-4 ${
          !expanded ? 'line-clamp-6' : ''
        }`}
      >
        {response}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-inherit">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            darkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Copy className="w-4 h-4" />
          <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {response.length > 300 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              darkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {expanded ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="text-sm">Show Less</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="text-sm">Expand</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
