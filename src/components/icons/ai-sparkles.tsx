
export const AiSparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <linearGradient id="ai-sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(180, 100%, 50%)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(300, 100%, 50%)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M12 2L9.8 8.2L3.6 10.4L9.8 12.6L12 18.8L14.2 12.6L20.4 10.4L14.2 8.2L12 2Z"
        fill="url(#ai-sparkle-gradient)"
        stroke="none"
      />
      <path d="M20 2L18.5 5.5L15 7L18.5 8.5L20 12L21.5 8.5L25 7L21.5 5.5L20 2Z" 
        transform="scale(0.5) translate(20, -10)"
        fill="url(#ai-sparkle-gradient)"
        stroke="none"
      />
       <path d="M5 18L4.25 20L2.5 20.75L4.25 21.5L5 23.25L5.75 21.5L7.5 20.75L5.75 20L5 18Z"
        transform="scale(0.6) translate(-10, -12)"
        fill="url(#ai-sparkle-gradient)"
        stroke="none"
      />
    </svg>
  );
  
