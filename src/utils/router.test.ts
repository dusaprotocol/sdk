import { describe, it, expect } from 'vitest'
import { decodeSwapTx, isLiquidtyMethod, isSwapMethod } from './router'
import { LIQUIDITY_ROUTER_METHODS, SWAP_ROUTER_METHODS } from '../types'
import { BUILDNET_CHAIN_ID } from '@massalabs/web3-utils'
import { PairV2, RouteV2, TradeV2 } from '../v2entities'
import {
  ClientFactory,
  DefaultProviderUrls,
  ProviderType
} from '@massalabs/massa-web3'
import { ChainId } from '../constants'
import {
  Percent,
  TokenAmount,
  USDC as _USDC,
  WETH as _WETH,
  WMAS as _WMAS
} from '../v1entities'
import { parseUnits } from '../lib/ethers'

describe('isSwapMethod', () => {
  it('should return true for valid swap method', () => {
    expect(SWAP_ROUTER_METHODS.map(isSwapMethod).every(Boolean)).toBe(true)
  })
  it('should return false for invalid swap method', () => {
    expect(isSwapMethod('swapExactTokensForTokenss')).toBe(false)
  })
})
describe('isLiquidtyMethod', () => {
  it('should return true for valid liquidity method', () => {
    expect(LIQUIDITY_ROUTER_METHODS.map(isLiquidtyMethod).every(Boolean)).toBe(
      true
    )
  })
  it('should return false for invalid liquidity method', () => {
    expect(isLiquidtyMethod('addLiquidityy')).toBe(false)
  })
})

describe('decodeSwapTx', async () => {
  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
  const CHAIN_ID = ChainId.BUILDNET
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    BUILDNET_CHAIN_ID,
    true
  )

  // init tokens and route bases
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]
  const BASES = [WMAS, USDC, WETH]

  // init input / output
  const inputToken = USDC
  const outputToken = WMAS

  // token pairs
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // all routes
  const allRoutes = RouteV2.createAllRoutes(
    allPairs,
    inputToken,
    outputToken,
    3
  )

  // user input for exactIn trade
  const typedValueIn = '5'
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString()

  const amountIn = new TokenAmount(inputToken, typedValueInParsed)

  it('should decode correctly', async () => {
    const isNativeOut = false

    const trades = await TradeV2.getTradesExactIn(
      allRoutes,
      amountIn,
      outputToken,
      false,
      isNativeOut,
      client,
      CHAIN_ID
    )

    const bestTrade = TradeV2.chooseBestTrade(trades, true)

    const options = {
      allowedSlippage: new Percent(50n, 10000n),
      ttl: 1000,
      recipient: '0x0000000000000000000000000000000000000000'
    }

    const params = bestTrade.swapCallParameters(options)

    const decoded = decodeSwapTx(
      params.methodName,
      Uint8Array.from(params.args.serialize()),
      params.value
    )
    expect(decoded.amountIn).toStrictEqual(BigInt(typedValueInParsed))
    expect(decoded.binSteps).toStrictEqual(bestTrade.quote.binSteps)
  })
})
