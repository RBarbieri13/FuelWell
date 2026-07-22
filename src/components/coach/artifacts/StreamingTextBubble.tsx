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
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-[1.5rem] rounded-bl-md border border-primary-100/80 bg-white/94 px-3 py-3 text-sm font-semibold leading-6 text-muted-foreground shadow-[0_18px_48px_rgba(22,48,42,0.08)] sm:px-4 md:max-w-[85%]">
      {text ? (
        <div className="max-w-full min-w-0 break-words [overflow-wrap:anywhere] [&>*]:max-w-full [&>*]:min-w-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {text}
          </ReactMarkdown>
          {streaming && (
            <span
              aria-hidden
              className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary-300 align-middle"
            />
          )}
        </div>
      ) : (
        <span className="flex gap-1" role="status" aria-label="Coach is typing">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:300ms]" />
        </span>
      )}
    </div>
  );
}

const markdownComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("mb-2 mt-1 break-words text-xl font-black leading-tight text-foreground [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("mb-2 mt-3 break-words text-lg font-black leading-tight text-foreground [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("mb-1.5 mt-3 break-words text-base font-black leading-tight text-foreground [overflow-wrap:anywhere]", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4 className={cn("mb-1.5 mt-2 break-words text-sm font-black uppercase tracking-wide text-muted-foreground [overflow-wrap:anywhere]", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("my-2 first:mt-0 last:mb-0 whitespace-pre-wrap break-words", className)} {...props} />
  ),
  strong: ({ className, ...props }: React.ComponentProps<"strong">) => (
    <strong className={cn("font-black text-foreground", className)} {...props} />
  ),
  em: ({ className, ...props }: React.ComponentProps<"em">) => (
    <em className={cn("font-semibold text-muted-foreground", className)} {...props} />
  ),
  a: ({ className, href, ...props }: React.ComponentProps<"a">) => (
    <a
      // py-3.5 pads the tap target to >=44px without shifting inline layout
      // (vertical padding on inline elements grows the hit area only).
      className={cn("break-words py-3.5 font-black text-primary-700 underline decoration-primary-300 underline-offset-4 [overflow-wrap:anywhere]", className)}
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
    <li className={cn("max-w-full break-words pl-1 leading-6 [overflow-wrap:anywhere] [&>ul]:mt-1.5 [&>ol]:mt-1.5", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("my-3 rounded-r-[1rem] border-l-4 border-primary-300 bg-primary-50/70 py-2 pl-3 pr-2 text-muted-foreground", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.ComponentProps<"hr">) => (
    <hr className={cn("my-4 border-primary-100", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="fw-rich-scroll my-3 w-full max-w-full min-w-0 overflow-x-auto rounded-[1.25rem] border border-primary-100 shadow-sm">
      <table className={cn("w-full min-w-[32rem] border-collapse text-left text-xs", className)} {...props} />
    </div>
  ),
  thead: ({ className, ...props }: React.ComponentProps<"thead">) => (
    <thead className={cn("bg-primary-700 text-white", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th className={cn("border-b border-primary-200 px-3 py-2 font-black", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("border-b border-primary-100 px-3 py-2 align-top", className)} {...props} />
  ),
  code: ({ className, children, ...props }: React.ComponentProps<"code">) => {
    const isBlock = /language-/.test(className ?? "");
    return (
      <code
        className={cn(
          isBlock
            ? "block max-w-full overflow-x-auto whitespace-pre rounded-[1.25rem] bg-primary-950 p-3 text-xs font-semibold leading-5 text-neutral-50"
            : "break-words rounded-md bg-primary-50 px-1.5 py-0.5 font-mono text-[0.85em] font-bold text-primary-800 [overflow-wrap:anywhere]",
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
      className={cn("my-3 max-h-72 w-full rounded-[1.25rem] border border-primary-100 object-cover shadow-sm", className)}
      alt={alt ?? ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  ),
};
