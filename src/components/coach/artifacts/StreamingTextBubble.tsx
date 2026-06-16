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
    <div className="max-w-[95%] rounded-3xl rounded-bl-md border border-primary-100 bg-white/92 px-4 py-3 text-sm font-semibold leading-6 text-neutral-800 shadow-sm shadow-primary-900/5 md:max-w-[85%]">
      {text ? (
        <div className="min-w-0">
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
    <h1 className={cn("mb-2 mt-1 text-xl font-black leading-tight text-neutral-950", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("mb-2 mt-3 text-lg font-black leading-tight text-neutral-950", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("mb-1.5 mt-3 text-base font-black leading-tight text-neutral-950", className)} {...props} />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4 className={cn("mb-1.5 mt-2 text-sm font-black uppercase tracking-wide text-neutral-700", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("my-2 first:mt-0 last:mb-0 whitespace-pre-wrap break-words", className)} {...props} />
  ),
  strong: ({ className, ...props }: React.ComponentProps<"strong">) => (
    <strong className={cn("font-black text-neutral-950", className)} {...props} />
  ),
  em: ({ className, ...props }: React.ComponentProps<"em">) => (
    <em className={cn("font-semibold text-neutral-700", className)} {...props} />
  ),
  a: ({ className, href, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn("font-black text-primary-700 underline decoration-primary-300 underline-offset-4", className)}
      href={href}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-2 ml-4 list-disc space-y-1.5 marker:text-primary-500", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-2 ml-4 list-decimal space-y-1.5 marker:font-black marker:text-primary-600", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("pl-1 leading-6 [&>ul]:mt-1.5 [&>ol]:mt-1.5", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("my-3 border-l-4 border-primary-300 bg-primary-50/70 py-2 pl-3 pr-2 text-neutral-700", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }: React.ComponentProps<"hr">) => (
    <hr className={cn("my-4 border-primary-100", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-2xl border border-primary-100">
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
            ? "block overflow-x-auto whitespace-pre rounded-2xl bg-neutral-950 p-3 text-xs font-semibold leading-5 text-neutral-50"
            : "rounded-md bg-primary-50 px-1.5 py-0.5 font-mono text-[0.85em] font-bold text-primary-800",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }: React.ComponentProps<"pre">) => (
    <pre className={cn("my-3 overflow-x-auto rounded-2xl bg-neutral-950 p-0", className)} {...props} />
  ),
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    // Markdown media can point to arbitrary user-requested URLs; Next Image
    // needs configured hosts and fixed sizing, so keep this as a plain image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn("my-3 max-h-72 w-full rounded-2xl border border-primary-100 object-cover", className)}
      alt={alt ?? ""}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  ),
};
