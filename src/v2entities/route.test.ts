import { ChainId } from '../constants'
import { USDC as _USDC, WETH as _WETH, WMAS as _WMAS } from '../v1entities'
import { PairV2 } from './pair'
import { RouteV2 } from './route'
import { describe, it, expect } from 'vitest'

describe('RouteV2.createAllRoute()', () => {
  // init tokens and route bases

  const CHAIN_ID = ChainId.BUILDNET
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const MAS = _WMAS[CHAIN_ID]
  const BASES = [MAS, USDC, WETH]

  // init input / output
  const inputToken = USDC
  const outputToken = MAS

  // token pairs
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // generate routes
  const hops = 4
  const allRoutes = RouteV2.createAllRoutes(
    allPairs,
    inputToken,
    outputToken,
    hops
  )

  it('generates routes with <= hops', () => {
    allRoutes.forEach((route) => {
      expect(route.pairs.length).toBeLessThanOrEqual(hops)
    })
  })

  it('generates routes with the correct input token', () => {
    allRoutes.forEach((route) => {
      expect(route.input.address).toBe(inputToken.address)
    })
  })

  it('generates routes with the correct output token', () => {
    allRoutes.forEach((route) => {
      expect(route.output.address).toBe(outputToken.address)
    })
  })

  it('generates routes without any overlapping tokens', () => {
    allRoutes.forEach((route) => {
      const set = new Set()
      route.path.forEach((token) => {
        expect(set.has(token.address)).toBe(false)
        set.add(token.address)
      })
    })
  })
})
