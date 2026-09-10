import React from 'react';

/**
 * Pixel-perfect Official WhatsApp vector symbol
 */
export const WhatsAppIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M17.472 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.301-.021-.465.13-.615.14-.135.301-.345.451-.523.149-.177.199-.301.299-.499.1-.201.05-.377-.025-.523-.075-.15-.674-1.62-.925-2.224-.244-.589-.49-.51-.672-.521-.176-.008-.376-.01-.577-.01-.2 0-.523.075-.798.375s-1.05 1.026-1.05 2.5 1.075 2.899 1.225 3.1c.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

/**
 * Modern AI Assistant / Bot vector symbol
 */
export const AIBotIcon = ({ className = 'w-5 h-5', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* Antenna & Signal beacon */}
    <line x1="12" y1="2" x2="12" y2="6" />
    <circle cx="12" cy="2" r="1" fill="currentColor" />
    {/* Bot Head with rounded curvature */}
    <rect x="3" y="6" width="18" height="13" rx="4" />
    {/* Left Eye & Right Eye */}
    <circle cx="8.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="11.5" r="1.5" fill="currentColor" stroke="none" />
    {/* AI Speech / Frequency line */}
    <path d="M8.5 15.5h7" strokeWidth="1.6" />
    {/* Ear antennas / Audio nodes */}
    <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" />
    <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" />
  </svg>
);

/**
 * AI Sparkle Core Emblem
 */
export const AISparkleIcon = ({ className = 'w-4 h-4', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);
