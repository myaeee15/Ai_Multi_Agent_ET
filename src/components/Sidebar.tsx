import { MessageSquare, Plus, BookmarkPlus, Clock, Bot, MessageCircle, Eye, Presentation, Search, Code } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
}

interface SidebarProps {
  darkMode: boolean;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
  onLoadPrompt: (content: string) => void;
}

const agentsList = [
  { name: 'Language Agent', icon: MessageCircle, color: 'from-blue-500 to-blue-600' },
  { name: 'Vision Agent', icon: Eye, color: 'from-green-500 to-green-600' },
  { name: 'Presentation Agent', icon: Presentation, color: 'from-purple-500 to-purple-600' },
  { name: 'Research Agent', icon: Search, color: 'from-orange-500 to-orange-600' },
  { name: 'Coding Agent', icon: Code, color: 'from-cyan-500 to-cyan-600' },
];

export default function Sidebar({ darkMode, onNewConversation, onSelectConversation, currentConversationId, onLoadPrompt }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'prompts' | 'agents'>('history');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
      loadSavedPrompts();
    }
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setConversations(data);
    }
  };

  const loadSavedPrompts = async () => {
    const { data, error } = await supabase
      .from('saved_prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setSavedPrompts(data);
    }
  };

  return (
    <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r w-80 flex flex-col transition-colors`}>
      <div className="p-4 border-b border-inherit">
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Conversation
        </button>
      </div>

      <div className={`flex border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? darkMode
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-blue-600 border-b-2 border-blue-600'
              : darkMode
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-1" />
          History
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'prompts'
              ? darkMode
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-blue-600 border-b-2 border-blue-600'
              : darkMode
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookmarkPlus className="w-4 h-4 inline-block mr-1" />
          Saved
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'agents'
              ? darkMode
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-blue-600 border-b-2 border-blue-600'
              : darkMode
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 inline-block mr-1" />
          Agents
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'history' && (
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentConversationId === conv.id
                      ? darkMode
                        ? 'bg-slate-800 text-white'
                        : 'bg-blue-50 text-blue-900'
                      : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium text-sm truncate">{conv.title}</span>
                  </div>
                  <span className="text-xs opacity-60">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="p-2 space-y-1">
            {savedPrompts.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <BookmarkPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved prompts yet</p>
              </div>
            ) : (
              savedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => onLoadPrompt(prompt.content)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{prompt.title}</div>
                  <div className="text-xs opacity-60 line-clamp-2">{prompt.content}</div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="p-2 space-y-2">
            {agentsList.map((agent) => (
              <div
                key={agent.name}
                className={`px-4 py-3 rounded-lg ${
                  darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-r ${agent.color} p-2 rounded-lg`}>
                    <agent.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {agent.name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
