'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cx } from '~/lib/cn'

interface NavItem {
  href: string
  label: string
  shortLabel?: string
  matches: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Directory',
    matches: (pathname) => pathname === '/' || pathname.startsWith('/c/'),
  },
  {
    href: '/digests/',
    label: 'Today',
    matches: (pathname) => pathname.startsWith('/digests'),
  },
  {
    href: '/metrics/',
    label: 'Metrics',
    matches: (pathname) => pathname.startsWith('/metrics'),
  },
  {
    href: '/about/',
    label: 'About & method',
    shortLabel: 'About',
    matches: (pathname) => pathname.startsWith('/about'),
  },
]

export function PrimaryNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="-mx-2 min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto sm:mx-0 sm:flex-none [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex h-[52px] items-stretch sm:gap-5">
        {navItems.map((item) => {
          const isActive = item.matches(pathname)
          return (
            <li key={item.href} className="flex shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cx(
                  'text-ink flex min-w-11 items-center justify-center border-y-[3px] border-transparent px-2 text-sm font-semibold whitespace-nowrap transition-colors',
                  isActive ? 'border-b-terra' : 'hover:border-b-rule-strong',
                )}
              >
                {item.shortLabel ? (
                  <>
                    <span className="sm:hidden">{item.shortLabel}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
