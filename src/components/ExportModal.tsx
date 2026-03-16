import { X, FileText, FileDown, File, Presentation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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

interface ExportModalProps {
  darkMode: boolean;
  messageId: string;
  responses: AgentResponseData[];
  prompt: string;
  fusedResponse: string | null;
  onClose: () => void;
}

export default function ExportModal({
  darkMode,
  messageId,
  responses,
  prompt,
  fusedResponse,
  onClose,
}: ExportModalProps) {
  const { user } = useAuth();

  const exportAsText = async () => {
    let content = `AI NEXUS - Multi-Agent Response Export\n`;
    content += `${'='.repeat(60)}\n\n`;
    content += `Prompt: ${prompt}\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    responses.forEach((response) => {
      const agent = agents.find((a) => a.type === response.agentType);
      if (!agent) return;

      content += `\n${'─'.repeat(60)}\n`;
      content += `${agent.name.toUpperCase()}\n`;
      content += `Response Time: ${response.responseTime}ms | Tokens: ${response.tokensUsed}\n`;
      if (response.isBest) content += `★ BEST RESPONSE ★\n`;
      content += `${'─'.repeat(60)}\n\n`;
      content += `${response.response}\n`;
    });

    if (fusedResponse) {
      content += `\n${'='.repeat(60)}\n`;
      content += `FUSED RESPONSE\n`;
      content += `${'='.repeat(60)}\n\n`;
      content += fusedResponse;
    }

    downloadFile(content, 'ai-nexus-export.txt', 'text/plain');
    await logExport('text');
  };

  const exportAsMarkdown = async () => {
    let content = `# AI Nexus - Multi-Agent Response\n\n`;
    content += `**Prompt:** ${prompt}\n\n`;
    content += `**Date:** ${new Date().toLocaleString()}\n\n`;
    content += `---\n\n`;

    responses.forEach((response) => {
      const agent = agents.find((a) => a.type === response.agentType);
      if (!agent) return;

      content += `## ${agent.name}\n\n`;
      content += `- **Response Time:** ${response.responseTime}ms\n`;
      content += `- **Tokens Used:** ${response.tokensUsed}\n`;
      if (response.isBest) content += `- **Status:** ⭐ Best Response\n`;
      content += `\n${response.response}\n\n`;
      content += `---\n\n`;
    });

    if (fusedResponse) {
      content += `## Fused Response\n\n`;
      content += `${fusedResponse}\n\n`;
    }

    downloadFile(content, 'ai-nexus-export.md', 'text/markdown');
    await logExport('markdown');
  };

  const exportAsPDF = async () => {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>AI Nexus Export</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #1e40af;
            margin-top: 30px;
            padding: 10px;
            background: #eff6ff;
            border-left: 4px solid #2563eb;
          }
          .meta {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .agent-info {
            color: #64748b;
            font-size: 0.9em;
            margin-bottom: 10px;
          }
          .best-badge {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
          }
          .response {
            white-space: pre-wrap;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
          }
          .fused {
            background: #dbeafe;
            border: 2px solid #2563eb;
          }
        </style>
      </head>
      <body>
        <h1>AI Nexus - Multi-Agent Response</h1>
        <div class="meta">
          <strong>Prompt:</strong> ${prompt}<br>
          <strong>Date:</strong> ${new Date().toLocaleString()}
        </div>
    `;

    responses.forEach((response) => {
      const agent = agents.find((a) => a.type === response.agentType);
      if (!agent) return;

      htmlContent += `
        <h2>${agent.name}</h2>
        <div class="agent-info">
          Response Time: ${response.responseTime}ms | Tokens: ${response.tokensUsed}
          ${response.isBest ? '<span class="best-badge">★ Best Response</span>' : ''}
        </div>
        <div class="response">${response.response.replace(/\n/g, '<br>')}</div>
      `;
    });

    if (fusedResponse) {
      htmlContent += `
        <h2>Fused Response</h2>
        <div class="response fused">${fusedResponse.replace(/\n/g, '<br>')}</div>
      `;
    }

    htmlContent += `
      </body>
      </html>
    `;

    downloadFile(htmlContent, 'ai-nexus-export.html', 'text/html');
    await logExport('pdf');
  };

  const exportAsPowerPoint = async () => {
    let content = `AI Nexus Export - PowerPoint Format\n\n`;
    content += `This export contains ${responses.length} agent responses.\n`;
    content += `Open this file in PowerPoint or convert using a tool.\n\n`;
    content += `Prompt: ${prompt}\n\n`;

    responses.forEach((response, index) => {
      const agent = agents.find((a) => a.type === response.agentType);
      if (!agent) return;

      content += `\nSLIDE ${index + 1}: ${agent.name}\n`;
      content += `${response.response.substring(0, 500)}...\n`;
    });

    downloadFile(content, 'ai-nexus-export-slides.txt', 'text/plain');
    await logExport('pptx');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const logExport = async (exportType: string) => {
    if (!user) return;

    await supabase.from('export_history').insert({
      user_id: user.id,
      message_id: messageId,
      export_type: exportType,
    });
  };

  const exportOptions = [
    {
      name: 'Text File',
      icon: FileText,
      description: 'Plain text format, compatible with all systems',
      action: exportAsText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Markdown',
      icon: File,
      description: 'Formatted markdown for documentation',
      action: exportAsMarkdown,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'PDF/HTML',
      icon: FileDown,
      description: 'Web-ready format for sharing',
      action: exportAsPDF,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'PowerPoint',
      icon: Presentation,
      description: 'Slide format for presentations',
      action: exportAsPowerPoint,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`${
          darkMode ? 'bg-slate-900' : 'bg-white'
        } rounded-2xl shadow-2xl w-full max-w-2xl`}
      >
        <div className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-6 flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Export Responses
            </h2>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Choose your preferred export format
            </p>
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                setTimeout(onClose, 500);
              }}
              className={`${
                darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'
              } rounded-xl p-6 text-left transition-all transform hover:scale-105`}
            >
              <div className={`bg-gradient-to-r ${option.color} p-3 rounded-xl w-fit mb-4`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {option.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
