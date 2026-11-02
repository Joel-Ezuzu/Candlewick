import { describe, expect, it } from 'vitest'
import { parseIds, toggleId } from './watchlist'

describe('parseIds', () => {
  it('reads a saved list', () => {
    expect(parseIds('["bitcoin","solana"]')).toEqual(['bitcoin', 'solana'])
  })
  it('gives an empty list for nothing, junk, or the wrong kind of data', () => {
    expect(parseIds(null)).toEqual([])
    expect(parseIds('not json')).toEqual([])
    expect(parseIds('{"a":1}')).toEqual([])
  })
  it('drops items that are not text, empty, or repeated', () => {
    expect(parseIds('["a", 5, null, "", "a", "b"]')).toEqual(['a', 'b'])
  })
  it('keeps a sensible limit', () => {
    const many = JSON.stringify(Array.from({ length: 250 }, (_, i) => `coin${i}`))
    expect(parseIds(many)).toHaveLength(100)
  })
})

describe('toggleId', () => {
  it('adds a new coin to the top', () => {
    expect(toggleId(['a', 'b'], 'c')).toEqual(['c', 'a', 'b'])
  })
  it('removes a coin that is already there', () => {
    expect(toggleId(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
  it('does not change the list it was given', () => {
    const ids = ['a']
    toggleId(ids, 'b')
    expect(ids).toEqual(['a'])
  })
})
