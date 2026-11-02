import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  full?: boolean
  /** Renders a link instead of a button. */
  to?: string
}

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const looks = {
  primary: 'bg-gold text-on-gold hover:brightness-105',
  secondary: 'border border-line bg-surface text-fg hover:border-gold',
}

export function Button({ children, variant = 'primary', full = false, to, type = 'button', className = '', ...rest }: ButtonProps) {
  const classes = [base, looks[variant], full ? 'w-full' : '', className].join(' ')
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
