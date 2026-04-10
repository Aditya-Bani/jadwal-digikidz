import React from 'react';

interface LinkifiedTextProps {
    text: string;
    className?: string;
}

export function LinkifiedText({ text, className }: LinkifiedTextProps) {
    // Regex to detect URLs (http, https, or common domain formats)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Split text by URLs and map into components
    const parts = text.split(urlRegex);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline break-all"
                            onClick={(e) => e.stopPropagation()} // Prevent parent click events (e.g. from Dialog)
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
}
