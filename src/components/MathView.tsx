import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  latex?: string;
  children?: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders LaTeX mathematical expressions using KaTeX
 */
export const MathView: React.FC<MathViewProps> = ({
  latex,
  children,
  block = false,
  className = '',
}) => {
  const content = (latex ?? children ?? '').trim();

  const renderedHtml = useMemo(() => {
    if (!content) return '';

    try {
      // If the string contains $ ... $ inline delimiters, parse inline/text
      if (content.includes('$')) {
        const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);
        return parts
          .map((part) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              const inner = part.slice(2, -2);
              return katex.renderToString(inner, {
                displayMode: true,
                throwOnError: false,
              });
            } else if (part.startsWith('$') && part.endsWith('$')) {
              const inner = part.slice(1, -1);
              return katex.renderToString(inner, {
                displayMode: false,
                throwOnError: false,
              });
            }
            return part;
          })
          .join('');
      }

      // Standard KaTeX rendering for a pure LaTeX string
      return katex.renderToString(content, {
        displayMode: block,
        throwOnError: false,
      });
    } catch {
      return content;
    }
  }, [content, block]);

  if (!content) return null;

  return (
    <span
      className={`math-rendered inline-flex items-center ${block ? 'justify-center w-full my-1.5' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
