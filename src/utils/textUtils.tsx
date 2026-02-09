import React from 'react';

/**
 * Parses simple Markdown-like text for Bold (**text**) and Indentation.
 * Leading spaces or "> " at the start of a line are treated as indentation.
 */
/**
 * Internal helper to parse content recursively for multiple styles.
 */
const renderLineContent = (text: string): React.ReactNode => {
    if (!text) return null;

    const regex = /(\*\*.*?\*\*|==.*?==|`.*?`|%%.*?%%)/g;
    const parts = text.split(regex);

    if (parts.length === 1) return text;

    return parts.map((part, i) => {
        if (!part) return null;

        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} style={{ fontWeight: 800 }}>
                    {renderLineContent(part.slice(2, -2))}
                </strong>
            );
        }
        if (part.startsWith('==') && part.endsWith('==')) {
            const content = part.slice(2, -2);
            const isBlue = content.endsWith('(c)');
            const isGreen = content.endsWith('(g)');

            let backgroundColor = '#ffd43b'; // Default yellow
            let textColor = '#000';
            let displayContent = content;

            if (isBlue) {
                backgroundColor = '#339af0';
                textColor = '#fff';
                displayContent = content.slice(0, -3);
            } else if (isGreen) {
                backgroundColor = '#51cf66';
                textColor = '#000';
                displayContent = content.slice(0, -3);
            }

            return (
                <mark key={i} style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                    padding: '0 4px',
                    borderRadius: '3px',
                    fontWeight: 600,
                    margin: '0 2px',
                    display: 'inline-block',
                    lineHeight: '1.2'
                }}>
                    {renderLineContent(displayContent)}
                </mark>
            );
        }
        if (part.startsWith('%%') && part.endsWith('%%')) {
            return (
                <span key={i} style={{
                    opacity: 0.5,
                    filter: 'grayscale(0.5)',
                    fontSize: '0.95em'
                }}>
                    {renderLineContent(part.slice(2, -2))}
                </span>
            );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'inherit'
                }}>
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
};

export const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split(/\r?\n/);

    return lines.map((line, lineIndex) => {
        // Detect indentation from leading spaces or "> "
        let indent = 0;
        let cleanLine = line;

        // Check for leading spaces
        const leadingSpaces = line.match(/^( +)/);
        if (leadingSpaces) {
            indent = leadingSpaces[0].length * 8;
            cleanLine = line.slice(leadingSpaces[0].length);
        } else if (line.startsWith('> ')) {
            indent = 24;
            cleanLine = line.slice(2);
        }

        return (
            <div
                key={lineIndex}
                style={{
                    paddingLeft: indent > 0 ? `${indent}px` : undefined,
                    minHeight: line.trim() === '' ? '0.8em' : '1.2em',
                    textAlign: 'inherit',
                    display: 'block',
                    width: '100%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}
            >
                {renderLineContent(cleanLine)}
            </div>
        );
    });
};

/**
 * Helper to handle Tab key in textarea to insert spaces for indentation
 */
export const handleTextareaTab = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    onChange: (newValue: string) => void
) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;

        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);

        // Need to set selection after update
        setTimeout(() => {
            if (e.currentTarget) {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
            }
        }, 0);
    }
};
