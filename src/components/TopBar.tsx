import { Bot, Moon, Sun, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function TopBar({ darkMode, toggleDarkMode }: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b px-6 py-4 flex items-center justify-between transition-colors`}>
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>AI Nexus</h1>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Multi-Agent AI Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {user?.email?.split('@')[0] || 'User'}
          </span>
        </div>

        <button
          onClick={signOut}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
