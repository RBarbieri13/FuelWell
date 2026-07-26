"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils/cn";

export type StreamingTextBubbleProps = {
  text: string;
  streaming: boolean;
};

export function StreamingTextBubble({ text, streaming }: StreamingTextBubbleProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-full min-w-0 md:max-w-[85%]",
        // With no text yet the bubble hugs the typing dots instead of stretching
        // an empty plate across the column.
        !text && "w-fit"
      )}
    >
      {/* Real tail, not just a tightened corner: a rotated plate tucked under
          the bubble's bottom-left, matching its fill and hairline so the shape
          points back at the avatar. It sits inside the avatar gutter, so it
          can never push the row wider than the column. */}
      <span
        aria-hidden="true"
        className="absolute bottom-3 -left-1 h-3 w-3 rotate-45 rounded-[3px] bg-surface ring-1 ring-inset ring-hairline"
      />
      <div
        aria-busy={streaming || undefined}
        className={cn(
          // The bottom-left corner tightens to meet the tail — the only
          // asymmetry, so the bubble still reads as belonging to the avatar.
          "relative max-w-full min-w-0 overflow-hidden rounded-[1.5rem] rounded-bl-md",
          "bg-surface px-3 py-3 text-sm font-semibold leading-6 text-ink",
          "shadow-e2 ring-1 ring-inset",
          // A live reply carries a faint primary ring, so an in-flight answer is
          // distinguishable from a settled one without moving anything.
          streaming ? "ring-primary-200" : "ring-hairline",
          "duration-300 ease-out-soft transition-shadow animate-in fade-in slide-in-from-bottom-1 sm:px-4"
        )}
      >
        {text ? (
          <div className="max-w-full min-w-0 break-words [overflow-wrap:anywhere] [&>*]:max-w-full [&>*]:min-w-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {text}
            </ReactMarkdown>
            {streaming && <StreamingCaret />}
          </div>
        ) : (
          <TypingIndicator />
        )}
      </div>
    </div>
  );
}

/**
 * Block caret that blinks on a soft curve rather than the default pulse, so a
 * paused stream reads as "still writing" instead of "element is broken".
 * Reduced motion leaves it solid and visible.
 */
function StreamingCaret() {
  return (
    <span
      aria-hidden
      className="ml-1 inline-block h-3.5 w-[3px] animate-caret-blink rounded-full bg-primary-500 align-middle motion-reduce:animate-none motion-reduce:opacity-100"
    />
  );
}

/**
 * Typing state. A jumping dot reads as a glitch at this size; a wave of
 * dots easing between 40% and 100% opacity/scale reads as thought in progress.
 * The dots sit on a sunken plate so the empty bubble has a floor instead of
 * looking like three stray specks, and under reduced motion they hold at three
 * legible opacities so the state stays distinguishable from a rendered reply.
 */
function TypingIndicator() {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full bg-surface-sunken px-2.5 py-1.5 ring-1 ring-inset ring-hairline"
      role="status"
      aria-label="Coach is typing"
    >
      {[0, 150, 300].map((delay, index) => (
        <span
          key={delay}
          aria-hidden="true"
          className={cn(
            "h-2 w-2 rounded-full bg-primary-500",
            "animate-in fade-in-40 zoom-in-50 repeat-infinite direction-alternate ease-out-soft",
            "motion-reduce:animate-none",
            index === 0 && "motion-reduce:opacity-100",
            index === 1 && "motion-reduce:opacity-70",
            index === 2 && "motion-reduce:opacity-40"
          )}
          style={{ animationDelay: `${delay}ms`, animationDuration: "620ms" }}
        />
      ))}
    </span>
  );
}

const markdownComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("mb-2 mt-1 break-words text-xl font-black leading-tight text-ink [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("mb-2 mt-3 break-words text-lg font-black leading-tight text-ink [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("mb-1.5 mt-3 break-words text-base font-black leading-tight text-ink [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4 className={cn("mb-1.5 mt-2 break-words text-[0.6875rem] font-black uppercase tracking-[0.12em] text-ink-subtle [overflow-wrap:anywhere]", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("my-2 first:mt-0 last:mb-0 whitespace-pre-wrap break-words", className)} {...props} />
  ),
  strong: ({ className, ...props }: React.ComponentProps<"strong">) => (
    <strong className={cn("font-black tabular-nums text-ink", className)} {...props} />
  ),
  em: ({ className, ...props }: React.ComponentProps<"em">) => (
    <em className={cn("font-semibold text-ink-muted", className)} {...props} />
  ),
  del: ({ className, ...props }: React.ComponentProps<"del">) => (
    // GFM strikethrough previously fell through unstyled and read as damaged
    // text; retiring it to the faint role makes "ruled out" look deliberate.
    <del
      className={cn("font-semibold text-ink-faint decoration-ink-faint decoration-2", className)}
      {...props}
    />
  ),
  input: ({ className, type, ...props }: React.ComponentProps<"input">) => (
    // GFM task lists render a raw checkbox — the one native control that leaks
    // default browser blue into an otherwise fully themed bubble.
    <input
      type={type}
      className={cn(
        type === "checkbox" &&
          "mr-1.5 h-3.5 w-3.5 -translate-y-px accent-primary-600 align-middle",
        className
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: React.ComponentProps<"a">) => (
    <a
      // py-3.5 pads the tap target to >=44px without shifting inline layout
      // (vertical padding on inline elements grows the hit area only).
      className={cn(
        "break-words rounded-sm py-3.5 font-black text-primary-700 underline decoration-primary-300 decoration-2 underline-offset-4 transition-colors duration-200 ease-out-soft [overflow-wrap:anywhere]",
        "hover:text-primary-800 hover:decoration-primary-500 active:text-primary-900",
        className
      )}
      href={href}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-2 ml-4 max-w-[calc(100%-1rem)] list-disc space-y-1.5 marker:text-primary-500", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-2 ml-4 max-w-[calc(100%-1rem)] list-decimal space-y-1.5 marker:font-black marker:text-primary-600", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li
      className={cn(
        "max-w-full break-words pl-1 leading-6 [overflow-wrap:anywhere] [&>ul]:mt-1.5 [&>ol]:mt-1.5",
        // A task-list row already carries a checkbox; the disc beside it is
        // double marking.
        "[&:has(>input[type=checkbox])]:-ml-4 [&:has(>input[type=checkbox])]:list-none",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn(
        "my-3 rounded-r-[1rem] border-l-[3px] border-primary-400 bg-primary-50/70 py-2 pl-3 pr-2 text-ink-muted",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.ComponentProps<"hr">) => (
    <hr className={cn("my-4 border-hairline", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    // Wide tables scroll inside their own well rather than pushing the bubble
    // past the viewport; the ring keeps the frame a hairline at any width.
    <div className="fw-rich-scroll my-3 w-full max-w-full min-w-0 overflow-x-auto rounded-[1.25rem] bg-surface ring-1 ring-inset ring-hairline-strong">
      <table
        className={cn("w-full min-w-[28rem] border-collapse text-left text-xs tabular-nums", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={cn("bg-primary-700 text-white", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-3 py-2 text-[0.6875rem] font-black uppercase tracking-[0.08em] first:rounded-tl-[1.15rem] last:rounded-tr-[1.15rem]",
        className
      )}
      {...props}
    />
  ),
  tbody: ({ className, ...props }: React.ComponentProps<"tbody">) => (
    // Zebra striping does the row-tracking work that gridlines do on a chart —
    // essential once a comparison table is wider than the bubble.
    <tbody className={cn("[&>tr:nth-child(even)]:bg-surface-subtle", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn("border-t border-hairline px-3 py-2 align-top font-semibold text-ink", className)}
      {...props}
    />
  ),
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    const isBlock = /language-/.test(className ?? "");
    return (
      <code
        className={cn(
          isBlock
            ? "block max-w-full overflow-x-auto whitespace-pre rounded-[1.25rem] bg-primary-950 p-3 font-mono text-xs font-semibold leading-5 text-primary-50"
            : "break-words rounded-md bg-primary-50 px-1.5 py-0.5 font-mono text-[0.85em] font-bold text-primary-800 ring-1 ring-inset ring-primary-100 [overflow-wrap:anywhere]",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }: React.ComponentProps<"pre">) => (
    <pre className={cn("fw-rich-scroll my-3 max-w-full overflow-x-auto rounded-[1.25rem] bg-primary-950 p-0", className)} {...props} />
  ),
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    // Markdown media can point to arbitrary user-requested URLs; Next Image
    // needs configured hosts and fixed sizing, so keep this as a plain image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn(
        "my-3 max-h-72 w-full rounded-[1.25rem] bg-surface-muted object-cover shadow-e1 ring-1 ring-inset ring-hairline",
        className
      )}
      alt={alt ?? ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  ),
};
