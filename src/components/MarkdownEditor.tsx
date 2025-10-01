import React, { useState } from 'react';
import { Eye, CreditCard as Edit, Image, Bold, Italic, Code, List, Hash } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder = "Write your content here..." }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);
    
    const newText = beforeText + before + selectedText + after + afterText;
    onChange(newText);
    
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`') },
    { icon: Hash, label: 'Header', action: () => insertMarkdown('## ', '') },
    { icon: List, label: 'List', action: () => insertMarkdown('- ', '') },
    { icon: Image, label: 'Image', action: () => insertMarkdown('![alt text](', ')') },
  ];

  const renderPreview = (markdown: string) => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-6">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded font-mono text-sm">$1</code>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gm, '<li class="ml-6 mb-2">• $1</li>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />');
    
    // Paragraphs
    html = html.replace(/^(?!<[hou]|<li)(.+)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  return (
    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {formatButtons.map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover-lift"
              title={label}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift ${
              !isPreview ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Edit
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift ${
              isPreview ? 'bg-blue-100 text-blue-700 shadow-md' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview
          </button>
        </div>
      </div>

      <div className="min-h-96 bg-white">
        {isPreview ? (
          <div className="p-8 prose max-w-none animate-fadeInUp">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: renderPreview(value) }} />
            ) : (
              <div className="text-center py-12 animate-fadeInUp">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-float" />
                <p className="text-gray-500 italic text-lg">Nothing to preview yet. Start writing something amazing!</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-96 p-8 resize-none border-0 focus:ring-0 focus:outline-none font-mono text-base leading-relaxed transition-all duration-300"
          />
        )}
      </div>
    </div>
  );
}