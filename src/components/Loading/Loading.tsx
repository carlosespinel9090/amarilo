interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

export function Loading({ size = 'md', label, fullScreen = false }: LoadingProps) {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-sm"
    >
      <span
        className={`inline-block animate-spin rounded-full border-n-200 border-t-yellow ${sizeClasses[size]}`}
      />
      {label && <span className="text-body-sm text-n-500">{label}</span>}
      <span className="sr-only">Cargando…</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
