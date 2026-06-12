"use client";

export type StreamingTextBubbleProps = {
  text: string;
  streaming: boolean;
};

/** Markdown-lite: line breaks and **bold** only — no library. */
function renderLine(line: string, lineIdx: number) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${lineIdx}-${i}`} className="font-black">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${lineIdx}-${i}`}>{part}</span>
    ),
  );
}

export function StreamingTextBubble({ text, streaming }: StreamingTextBubbleProps) {
  const lines = text.split("\n");

  return (
    <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-white px-4 py-3 text-sm font-medium leading-6 text-neutral-800 shadow-sm">
      {text ? (
        <p className="whitespace-pre-wrap break-words">
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && "\n"}
              {renderLine(line, i)}
            </span>
          ))}
          {streaming && (
            <span
              aria-hidden
              className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-neutral-300 align-middle"
            />
          )}
        </p>
      ) : (
        <span className="flex gap-1" role="status" aria-label="Coach is typing">
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
        </span>
      )}
    </div>
  );
}
