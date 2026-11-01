'use client';

import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Parses bold, inline code, and hex color swatches within a single line or segment.
 */
function formatInline(text: string): React.ReactNode[] {
  // 1. Tokenize by inline code `...`
  const codeRegex = /`([^`]+)`/g;
  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const processText = (str: string, keyPrefix: string): React.ReactNode[] => {
    // 2. Tokenize by **bold**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const subTokens: React.ReactNode[] = [];
    let subLastIndex = 0;
    let bMatch: RegExpExecArray | null;

    while ((bMatch = boldRegex.exec(str)) !== null) {
      if (bMatch.index > subLastIndex) {
        subTokens.push(
          formatHexInText(str.substring(subLastIndex, bMatch.index), `${keyPrefix}-t-${subLastIndex}`)
        );
      }
      subTokens.push(
        <strong key={`${keyPrefix}-b-${bMatch.index}`} className="font-semibold text-on-surface">
          {formatHexInText(bMatch[1], `${keyPrefix}-bi-${bMatch.index}`)}
        </strong>
      );
      subLastIndex = boldRegex.lastIndex;
    }
    if (subLastIndex < str.length) {
      subTokens.push(
        formatHexInText(str.substring(subLastIndex), `${keyPrefix}-t-${subLastIndex}`)
      );
    }
    return subTokens;
  };

  const formatHexInText = (textPart: string, key: string): React.ReactNode => {
    // 3. Highlight hex color codes with inline live color chip
    const hexRegex = /(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))\b/g;
    const parts: React.ReactNode[] = [];
    let hexLast = 0;
    let hMatch: RegExpExecArray | null;

    while ((hMatch = hexRegex.exec(textPart)) !== null) {
      if (hMatch.index > hexLast) {
        parts.push(textPart.substring(hexLast, hMatch.index));
      }
      const hex = hMatch[1];
      parts.push(
        <span
          key={`${key}-hex-${hMatch.index}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-medium bg-surface-container-high px-1.5 py-0.5 rounded border border-primary/10 align-baseline text-on-surface mx-0.5"
        >
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs shrink-0 inline-block align-middle"
            style={{ backgroundColor: hex }}
            aria-hidden="true"
          />
          {hex}
        </span>
      );
      hexLast = hexRegex.lastIndex;
    }
    if (hexLast < textPart.length) {
      parts.push(textPart.substring(hexLast));
    }
    return <React.Fragment key={key}>{parts}</React.Fragment>;
  };

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        ...processText(text.substring(lastIndex, match.index), `txt-${lastIndex}`)
      );
    }
    const codeVal = match[1];
    const isHex = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/i.test(codeVal);
    if (isHex) {
      tokens.push(
        <span
          key={`code-hex-${match.index}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold bg-surface-container-high px-1.5 py-0.5 rounded border border-primary/15 align-baseline text-on-surface mx-0.5"
        >
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs shrink-0 inline-block align-middle"
            style={{ backgroundColor: codeVal }}
            aria-hidden="true"
          />
          {codeVal}
        </span>
      );
    } else {
      tokens.push(
        <code
          key={`code-${match.index}`}
          className="font-mono text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/15 font-semibold"
        >
          {codeVal}
        </code>
      );
    }
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(
      ...processText(text.substring(lastIndex), `txt-${lastIndex}`)
    );
  }

  return tokens;
}

/**
 * Beautiful, lightweight zero-dependency Markdown renderer for AI Concierge chat.
 * Correctly renders headers, bullet lists, bold text, inline code, and hex color swatches.
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  const flushList = (listIndex: number) => {
    if (currentList.length === 0) return;
    elements.push(
      <ul key={`ul-${listIndex}`} className="my-2 space-y-1.5 pl-1">
        {currentList.map((item, i) => (
          <li key={i} className="flex items-start gap-2 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 mt-2" aria-hidden="true" />
            <span className="flex-1">{formatInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for unordered bullet list: * or -
    if (/^(\*|-)\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^(\*|-)\s+/, ''));
      return;
    }

    // If not a list item, flush any accumulated list items first
    flushList(index);

    // Empty lines
    if (!trimmed) {
      elements.push(<div key={`spacer-${index}`} className="h-2" />);
      return;
    }

    // Heading 3: ### Heading
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="font-serif text-base sm:text-lg font-bold text-primary mt-3 mb-1 tracking-tight"
        >
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    // Heading 4: #### Heading
    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4
          key={`h4-${index}`}
          className="font-sans text-sm sm:text-base font-bold text-on-surface mt-2.5 mb-1"
        >
          {formatInline(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed my-1">
        {formatInline(trimmed)}
      </p>
    );
  });

  // Flush any remaining list
  flushList(lines.length);

  return <div className={`markdown-body space-y-1 ${className}`}>{elements}</div>;
}
