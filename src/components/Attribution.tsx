/** The price service asks for a credit wherever its data is shown. */
export function Attribution() {
  return (
    <p className="mt-6 text-sm text-muted">
      Prices from{' '}
      <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gold hover:underline">
        CoinGecko
      </a>
      .
    </p>
  )
}
