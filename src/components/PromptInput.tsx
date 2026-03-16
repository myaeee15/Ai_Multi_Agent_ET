import { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';

interface PromptInputProps {
  darkMode: boolean;
  onSubmit: (prompt: string, files: File[]) => void;
  loading: boolean;
  initialPrompt?: string;
}

export default function PromptInput({ darkMode, onSubmit, loading, initialPrompt = '' }: PromptInputProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || files.length > 0) {
      onSubmit(prompt, files);
      setPrompt('');
      setFiles([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-4`}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {getFileIcon(file)}
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`flex gap-3 items-end ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-2xl p-3`}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
            disabled={loading}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx"
          />

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask multiple AI agents anything..."
            className={`flex-1 bg-transparent ${darkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'} outline-none resize-none min-h-[60px] max-h-[200px]`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || (!prompt.trim() && files.length === 0)}
            className={`bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
