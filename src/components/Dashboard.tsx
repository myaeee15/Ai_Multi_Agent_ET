import { X, TrendingUp, Zap, Award, BarChart3 } from 'lucide-react';
import { agents } from '../lib/agents';

interface AgentResponseData {
  id: string;
  agentType: string;
  response: string;
  tokensUsed: number;
  responseTime: number;
  rating: number;
  isBest: boolean;
}

interface DashboardProps {
  darkMode: boolean;
  responses: AgentResponseData[];
  onClose: () => void;
}

export default function Dashboard({ darkMode, responses, onClose }: DashboardProps) {
  const calculateStats = () => {
    if (responses.length === 0) return null;

    const avgResponseTime = Math.round(
      responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    );
    const totalTokens = responses.reduce((sum, r) => sum + r.tokensUsed, 0);
    const avgTokens = Math.round(totalTokens / responses.length);

    const agentStats = agents.map((agent) => {
      const agentResponses = responses.filter((r) => r.type === agent.type);
      if (agentResponses.length === 0) return null;

      const avgTime = Math.round(
        agentResponses.reduce((sum, r) => sum + r.responseTime, 0) / agentResponses.length
      );
      const avgRating =
        agentResponses.reduce((sum, r) => sum + r.rating, 0) / agentResponses.length;
      const bestCount = agentResponses.filter((r) => r.isBest).length;

      return {
        agent,
        avgTime,
        avgRating,
        bestCount,
        responseCount: agentResponses.length,
      };
    }).filter(Boolean);

    const fastestAgent = agentStats.reduce((fastest, current) =>
      current && (!fastest || current.avgTime < fastest.avgTime) ? current : fastest
    , agentStats[0]);

    const mostUseful = agentStats.reduce((best, current) =>
      current && (!best || current.avgRating > best.avgRating) ? current : best
    , agentStats[0]);

    return {
      avgResponseTime,
      totalTokens,
      avgTokens,
      fastestAgent,
      mostUseful,
      agentStats,
    };
  };

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`${
          darkMode ? 'bg-slate-900' : 'bg-white'
        } rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}
      >
        <div className={`sticky top-0 ${darkMode ? 'bg-slate-900' : 'bg-white'} border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-6 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Performance Dashboard
              </h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                AI Agent Analytics & Insights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!stats ? (
            <div className="text-center py-12">
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No data available. Submit a prompt to see analytics.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div
                  className={`${
                    darkMode ? 'bg-slate-800/50' : 'bg-blue-50'
                  } rounded-xl p-6`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Avg Response Time
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {stats.avgResponseTime}ms
                  </div>
                </div>

                <div
                  className={`${
                    darkMode ? 'bg-slate-800/50' : 'bg-green-50'
                  } rounded-xl p-6`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Total Tokens Used
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {stats.totalTokens.toLocaleString()}
                  </div>
                </div>

                <div
                  className={`${
                    darkMode ? 'bg-slate-800/50' : 'bg-purple-50'
                  } rounded-xl p-6`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Avg Tokens/Response
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {stats.avgTokens}
                  </div>
                </div>
              </div>

              {stats.fastestAgent && (
                <div
                  className={`${
                    darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                  } rounded-xl p-6 mb-6`}
                >
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Top Performers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${darkMode ? 'bg-slate-900/50' : 'bg-white'} rounded-lg p-4`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`bg-gradient-to-r ${stats.fastestAgent.agent.color} p-2 rounded-lg`}>
                          <stats.fastestAgent.agent.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Fastest Agent
                          </div>
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {stats.fastestAgent.agent.name}
                          </div>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {stats.fastestAgent.avgTime}ms
                      </div>
                    </div>

                    {stats.mostUseful && (
                      <div className={`${darkMode ? 'bg-slate-900/50' : 'bg-white'} rounded-lg p-4`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`bg-gradient-to-r ${stats.mostUseful.agent.color} p-2 rounded-lg`}>
                            <stats.mostUseful.agent.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              Most Useful
                            </div>
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {stats.mostUseful.agent.name}
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {stats.mostUseful.avgRating > 0 ? '+' : ''}{stats.mostUseful.avgRating.toFixed(1)} rating
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Agent Performance Breakdown
                </h3>
                <div className="space-y-3">
                  {stats.agentStats.map((stat) => {
                    if (!stat) return null;
                    return (
                      <div
                        key={stat.agent.type}
                        className={`${
                          darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                        } rounded-xl p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`bg-gradient-to-r ${stat.agent.color} p-2 rounded-lg`}>
                              <stat.agent.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {stat.agent.name}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {stat.responseCount} response{stat.responseCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {stat.avgTime}ms
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Avg Time
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {stat.avgRating > 0 ? '+' : ''}{stat.avgRating.toFixed(1)}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Rating
                              </div>
                            </div>
                            <div className="text-center">
                              <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {stat.bestCount}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Best
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
