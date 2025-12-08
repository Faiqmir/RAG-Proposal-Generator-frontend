import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import './ReportViewer.css';

function MarkdownDisplay({ markdown }) {
  const containerRef = useRef(null);

  // Auto-scroll to top when content updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [markdown]);

  // Debug: Log markdown content to verify it's being received
  console.log('Original markdown:', markdown?.substring(0, 200) + '...');
  console.log('Markdown type:', typeof markdown);
  console.log('Line breaks test:', markdown?.includes('\n'));

  // Ensure proper markdown formatting
  const processedMarkdown = markdown ? markdown
    // Fix common formatting issues
    .replace(/\\n/g, '\n')  // Convert literal \n to actual newlines
    .replace(/\n\n+/g, '\n\n')  // Normalize multiple newlines
    .replace(/^\s+|\s+$/g, '')  // Trim leading/trailing whitespace
    .trim() : '';

  return (
    <div className="markdown-container" ref={containerRef}>
      <div className="markdown-content">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
            h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
            h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
            h4: ({children}) => <h4 className="markdown-h4">{children}</h4>,
            h5: ({children}) => <h5 className="markdown-h5">{children}</h5>,
            h6: ({children}) => <h6 className="markdown-h6">{children}</h6>,
            p: ({children}) => <p className="markdown-p">{children}</p>,
            ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
            ol: ({children}) => <ol className="markdown-ol">{children}</ol>,
            li: ({children}) => <li className="markdown-li">{children}</li>,
            strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
            em: ({children}) => <em className="markdown-em">{children}</em>,
            blockquote: ({children}) => <blockquote className="markdown-blockquote">{children}</blockquote>,
            table: ({node, ...props}) => (
              <div className="table-wrapper">
                <table {...props} className="markdown-table" style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #e1e4e8',
                  background: '#ffffff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }} />
              </div>
            ),
            thead: ({node, ...props}) => <thead {...props} className="markdown-thead" />,
            tbody: ({node, ...props}) => <tbody {...props} className="markdown-tbody" />,
            tr: ({node, ...props}) => <tr {...props} className="markdown-tr" style={{
              backgroundColor: 'transparent'
            }} />,
            th: ({node, ...props}) => <th {...props} className="markdown-th" style={{
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '14px',
              padding: '12px 16px',
              textAlign: 'left',
              borderBottom: '1px solid #e1e4e8',
              borderRight: '1px solid #e1e4e8'
            }} />,
            td: ({node, ...props}) => <td {...props} className="markdown-td" style={{
              padding: '12px 16px',
              textAlign: 'left',
              borderBottom: '1px solid #e1e4e8',
              borderRight: '1px solid #e1e4e8',
              backgroundColor: '#ffffff'
            }} />,
            hr: ({node, ...props}) => <hr {...props} className="markdown-hr" />,
            code: ({inline, children, ...props}) => {
              return inline ? 
                <code {...props} className="markdown-inline-code">{children}</code> : 
                <pre {...props} className="markdown-code-block"><code>{children}</code></pre>
            },
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default MarkdownDisplay;