import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex?: string;
  inline?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ latex, inline = false, className = '' }) => {
  if (!latex) return null;

  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: !inline,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      return `<span class="text-amber-300 font-mono">${latex}</span>`;
    }
  }, [latex, inline]);

  return (
    <span
      className={`math-rendered select-text ${inline ? 'inline-block px-1' : 'block my-2 overflow-x-auto py-1'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
