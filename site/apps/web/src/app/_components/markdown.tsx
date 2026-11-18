import type { ComponentPropsWithoutRef } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cx } from '~/lib/cn'

interface Props {
  children: string
  className?: string
}

const components: Components = {
  h1: (props) => (
    <h1
      {...props}
      className="text-ink mt-2 mb-4 text-[2rem] leading-tight font-bold tracking-[-0.01em] text-balance"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="border-ink text-ink mt-10 mb-3 border-b-[1.5px] pb-1.5 text-[1.375rem] leading-snug font-bold text-balance"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="text-ink mt-7 mb-2 text-lg leading-snug font-bold text-balance"
    />
  ),
  h4: (props) => (
    <h4
      {...props}
      className="text-ink mt-6 mb-1.5 text-[0.8125rem] font-bold tracking-[0.08em] uppercase"
    />
  ),
  p: (props) => <p {...props} className="text-ink my-3" />,
  ul: (props) => (
    <ul
      {...props}
      className="marker:text-ink-3 my-3 list-disc space-y-1.5 pl-5"
    />
  ),
  ol: (props) => (
    <ol
      {...props}
      className="marker:text-ink-2 my-3 list-decimal space-y-1.5 pl-6"
    />
  ),
  li: (props) => <li {...props} className="text-ink pl-1" />,
  a: (props: ComponentPropsWithoutRef<'a'>) => (
    <a
      {...props}
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noreferrer noopener' : undefined}
      className="text-link decoration-link/45 hover:text-ink hover:decoration-ink break-words underline underline-offset-[0.2em]"
    />
  ),
  strong: (props) => <strong {...props} className="text-ink font-bold" />,
  em: (props) => <em {...props} className="italic" />,
  code: (props) => (
    <code
      {...props}
      className="bg-paper-deep text-ink rounded-sm px-1 py-0.5 font-mono text-[0.85em]"
    />
  ),
  hr: () => <hr className="border-rule my-8" />,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="bg-field text-ink before:bg-tape-mustard/80 relative my-6 rotate-[-0.4deg] px-5 pt-5 pb-3 shadow-sm before:absolute before:-top-2 before:left-6 before:h-4 before:w-20 before:rotate-[-3deg] before:content-[''] [&>p]:my-2"
    />
  ),
  table: (props) => (
    <div className="my-5 overflow-x-auto">
      <table
        {...props}
        className="min-w-full border-collapse text-[0.875rem]"
      />
    </div>
  ),
  thead: (props) => <thead {...props} className="text-left" />,
  th: (props) => (
    <th
      {...props}
      className="border-ink text-ink-2 border-b-[1.5px] px-2.5 py-1.5 text-[11px] font-bold tracking-[0.07em] whitespace-nowrap uppercase"
    />
  ),
  td: (props) => (
    <td {...props} className="border-rule border-b px-2.5 py-1.5 align-top" />
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} className="border-rule my-6 w-full border" />
  ),
}

export function Markdown({ children, className }: Props) {
  return (
    <div
      className={cx(
        'text-ink max-w-[68ch] text-[1.0625rem] leading-[1.65]',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
