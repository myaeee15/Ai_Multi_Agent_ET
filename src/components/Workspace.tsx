import { useState, useEffect } from 'react';
import { Sparkles, Shuffle, FileDown, BarChart3 } from 'lucide-react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import PromptInput from './PromptInput';
import AgentCard from './AgentCard';
import Dashboard from './Dashboard';
import ExportModal from './ExportModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { agents, generateAgentResponses, determineBestAgent, generateFusedResponse } from '../lib/agents';

interface AgentResponseData {
  id: string;
  agentType: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
  rating: number;
  isBest: boolean;
}

export default function Workspace() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [responses, setResponses] = useState<AgentResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fusedResponse, setFusedResponse] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [promptText, setPromptText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      createNewConversation();
    }
  }, [user]);

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
      })
      .select()
      .single();

    if (!error && data) {
      setCurrentConversationId(data.id);
      setResponses([]);
      setFusedResponse(null);
      setCurrentMessageId(null);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setResponses([]);
    setFusedResponse(null);

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (messages && messages.length > 0) {
      const latestMessage = messages[0];
      setCurrentMessageId(latestMessage.id);
      setPromptText(latestMessage.content);

      const { data: agentResponses } = await supabase
        .from('agent_responses')
        .select('*')
        .eq('message_id', latestMessage.id);

      if (agentResponses) {
        setResponses(agentResponses.map(r => ({
          id: r.id,
          agentType: r.agent_type,
          response: r.response,
          tokensUsed: r.tokens_used,
          responseTime: r.response_time_ms,
          rating: r.rating,
          isBest: r.is_best,
        })));
      }
    }
  };

  const handleSubmitPrompt = async (prompt: string, files: File[]) => {
    if (!user || !currentConversationId) return;

    setLoading(true);
    setResponses([]);
    setFusedResponse(null);
    setPromptText(prompt);

    const filesMetadata = files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        content: prompt,
        files: filesMetadata,
      })
      .select()
      .single();

    if (messageError || !message) {
      setLoading(false);
      return;
    }

    setCurrentMessageId(message.id);

    await supabase
      .from('conversations')
      .update({
        title: prompt.substring(0, 50),
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentConversationId);

    const agentResponses = await generateAgentResponses(prompt, files);
    const bestAgentType = determineBestAgent(agentResponses);

    const responsesData: AgentResponseData[] = [];

    for (const agentResponse of agentResponses) {
      const { data: savedResponse } = await supabase
        .from('agent_responses')
        .insert({
          message_id: message.id,
          agent_type: agentResponse.agentType,
          response: agentResponse.response,
          tokens_used: agentResponse.tokensUsed,
          response_time_ms: agentResponse.responseTime,
          is_best: agentResponse.agentType === bestAgentType,
        })
        .select()
        .single();

      if (savedResponse) {
        responsesData.push({
          id: savedResponse.id,
          agentType: savedResponse.agent_type,
          response: savedResponse.response,
          tokensUsed: savedResponse.tokens_used,
          responseTime: savedResponse.response_time_ms,
          rating: savedResponse.rating,
          isBest: savedResponse.is_best,
        });
      }
    }

    setResponses(responsesData);
    setLoading(false);
  };

  const handleRatingChange = (id: string, rating: number) => {
    setResponses(responses.map(r => (r.id === id ? { ...r, rating } : r)));
  };

  const handleGenerateFusion = async () => {
    if (responses.length === 0) return;
    setLoading(true);
    const agentResponses = responses.map(r => ({
      agentType: r.agentType,
      response: r.response,
      tokensUsed: r.tokensUsed,
      responseTime: r.responseTime,
    }));
    const fused = await generateFusedResponse(agentResponses);
    setFusedResponse(fused);
    setLoading(false);
  };

  const handleLoadPrompt = (content: string) => {
    setPromptText(content);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} flex flex-col transition-colors`}>
      <TopBar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          darkMode={darkMode}
          onNewConversation={createNewConversation}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
          onLoadPrompt={handleLoadPrompt}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {responses.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-3xl mb-6">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Welcome to AI Nexus
                  </h2>
                  <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ask one question, get insights from 5 specialized AI agents
                  </p>
                </div>
              )}

              {loading && responses.length === 0 && (
                <div className="text-center py-20">
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-3xl mb-6 animate-pulse">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    AI Agents Processing...
                  </h2>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Multiple agents are analyzing your request
                  </p>
                </div>
              )}

              {responses.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      Agent Responses
                    </h2>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDashboard(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={handleGenerateFusion}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        } disabled:opacity-50`}
                      >
                        <Shuffle className="w-4 h-4" />
                        Generate Fusion
                      </button>
                      <button
                        onClick={() => setShowExport(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                          darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <FileDown className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {responses.map((response) => {
                      const agent = agents.find((a) => a.type === response.agentType);
                      if (!agent) return null;

                      return (
                        <AgentCard
                          key={response.id}
                          id={response.id}
                          agentType={response.agentType}
                          agentName={agent.name}
                          agentIcon={agent.icon}
                          agentColor={agent.color}
                          response={response.response}
                          tokensUsed={response.tokensUsed}
                          responseTime={response.responseTime}
                          rating={response.rating}
                          isBest={response.isBest}
                          darkMode={darkMode}
                          onRatingChange={handleRatingChange}
                        />
                      );
                    })}
                  </div>

                  {fusedResponse && (
                    <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'} border-2 rounded-2xl p-6 mb-6`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Fused Response
                        </h3>
                      </div>
                      <div className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed whitespace-pre-wrap`}>
                        {fusedResponse}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <PromptInput
            darkMode={darkMode}
            onSubmit={handleSubmitPrompt}
            loading={loading}
            initialPrompt={promptText}
          />
        </div>
      </div>

      {showDashboard && (
        <Dashboard
          darkMode={darkMode}
          responses={responses}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {showExport && currentMessageId && (
        <ExportModal
          darkMode={darkMode}
          messageId={currentMessageId}
          responses={responses}
          prompt={promptText}
          fusedResponse={fusedResponse}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
