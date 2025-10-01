import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderContent = (markdown: string) => {
    // Simple markdown parsing - in production, you'd use a library like react-markdown
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-gray-900 mt-8 mb-6">$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em class="font-bold italic">$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded font-mono text-sm">$1</code>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gm, '<li class="ml-6 mb-2 list-disc">$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 mb-2 list-decimal">$1. $2</li>');
    
    // Wrap lists in ul/ol tags
    html = html.replace(/(<li[^>]*class="[^"]*list-disc[^"]*"[^>]*>.*<\/li>)/gs, '<ul class="my-4">$1</ul>');
    html = html.replace(/(<li[^>]*class="[^"]*list-decimal[^"]*"[^>]*>.*<\/li>)/gs, '<ol class="my-4">$1</ol>');
    
    // Paragraphs
    html = html.replace(/^(?!<[hou]|<li|<pre)(.+)$/gm, '<p class="mb-4 leading-relaxed text-gray-700">$1</p>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderContent(content) }}
    />
  );
}