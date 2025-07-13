import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import React from "react";

export default function MarkdownRender({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={
        {
          p: ({ node, ...props }: any) => (
            <p className="text-sm leading-relaxed mb-4" {...props} />
          ),
          h1: ({ node, ...props }: any) => (
            <h1 className="text-2xl font-bold mb-4" {...props} />
          ),
          h2: ({ node, ...props }: any) => (
            <h2 className="text-xl font-bold mb-3" {...props} />
          ),
          h3: ({ node, ...props }: any) => (
            <h3 className="text-lg font-bold mb-2" {...props} />
          ),
          ul: ({ node, ...props }: any) => (
            <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }: any) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }: any) => (
            <li className="text-sm" {...props} />
          ),
          code: ({ node, ...props }: any) => (
            <code
              className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            />
          ),
          pre: ({ node, ...props }: any) => (
            <pre
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4 overflow-x-auto"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }: any) => (
            <blockquote
              className="border-l-4 border-gray-600 pl-4 italic my-4"
              {...props}
            />
          ),
          a: ({ node, ...props }: any) => {
            // Check if the link is an image URL
            const href = props.href || "";
            if (href.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
              return (
                <img
                  src={href}
                  alt={props.children?.[0] || "Image"}
                  className="max-w-full h-auto rounded-lg my-4"
                  loading="lazy"
                />
              );
            }
            // Regular link
            return (
              <a
                {...props}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline"
              />
            );
          },
          img: ({ node, ...props }: any) => {
            const [isLoading, setIsLoading] = React.useState(true);
            const [hasError, setHasError] = React.useState(false);

            return (
              <img
                {...props}
                className={`max-w-full h-auto rounded-lg my-4 transition-opacity duration-200 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            );
          },
        } as Components
      }
    >
      {content}
    </ReactMarkdown>
  );
}
