import { useState } from 'react'

/** The coin's logo, or its first letter if the logo will not load. */
export function CoinIcon({ name, image }: { name: string; image: string }) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-sm font-bold text-gold">
        {name.charAt(0).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={image}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-10 shrink-0 rounded-full bg-surface-2"
    />
  )
}
