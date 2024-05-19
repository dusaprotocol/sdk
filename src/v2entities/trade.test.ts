import {
  Percent,
  TokenAmount,
  USDC as _USDC,
  WETH as _WETH,
  WMAS as _WMAS
} from '../v1entities'
import { PairV2 } from './pair'
import { RouteV2 } from './route'
import { TradeV2 } from './trade'
import { parseUnits } from '../lib/ethers'
import { ChainId } from '../constants'
import {
  Args,
  ArrayTypes,
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls
} from '@massalabs/massa-web3'
import { describe, it, expect } from 'vitest'
import { ILBPair } from '../contracts'

describe('TradeV2 entity', async () => {
  const CHAIN_ID = ChainId.BUILDNET
  const client = await ClientFactory.createDefaultClient(
    DefaultProviderUrls.BUILDNET,
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
  const allPairs = PairV2.initPairs(allTokenPairs)

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

  // user input for exactOut trade
  const typedValueOut = '1'
  const typedValueOutParsed = parseUnits(
    typedValueOut,
    outputToken.decimals
  ).toString()
  const amountOut = new TokenAmount(outputToken, typedValueOutParsed)

  describe('TradeV2.getTradesExactIn()', () => {
    it('generates at least one trade', async () => {
      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      expect(trades.length).toBeGreaterThan(0)
    })
  })
  describe('TradeV2.getTradesExactOut()', () => {
    it('generates at least one exact out trade', async () => {
      const trades = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      expect(trades.length).toBeGreaterThan(0)
    })
    it('calculates price impact correctly', async () => {
      const pairAddress = await allPairs[0]
        .fetchLBPair(20, client, CHAIN_ID)
        .then((r) => r.LBPair)
      const pair = new ILBPair(pairAddress, client)
      const { reserveX, reserveY } = await pair.getReservesAndId()
      const tokens = await pair.getTokens()
      const outputTokenReserves =
        tokens[1] === outputToken.address ? reserveY : reserveX
      const amountOut = new TokenAmount(outputToken, outputTokenReserves)

      const trades = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      if (!trades[0]) {
        throw new Error('No trades')
      }

      expect(Number(trades[0].priceImpact.toFixed(2))).toBeGreaterThan(0.5)
    })
  })
  describe('TradeV2.chooseBestTrade()', () => {
    it('chooses the best trade among exactIn trades', async () => {
      const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      const isExactIn = true

      let maxOutputAmount = (trades[0] as TradeV2).outputAmount.raw

      trades.forEach((trade) => {
        if (trade) {
          if (trade.outputAmount.raw > maxOutputAmount) {
            maxOutputAmount = trade.outputAmount.raw
          }
        }
      })

      const bestTrade = TradeV2.chooseBestTrade(trades, isExactIn)

      expect(maxOutputAmount === (bestTrade as TradeV2).outputAmount.raw).toBe(
        true
      )
    })
    it('chooses the best trade among exactOut trades', async () => {
      const trades = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      const isExactIn = false

      let minInputAmount = trades[0]?.inputAmount.raw || 0n

      trades.forEach((trade) => {
        if (!trade) return

        if (
          trade.inputAmount.raw > 0n &&
          (minInputAmount == 0n || trade.inputAmount.raw < minInputAmount)
        ) {
          minInputAmount = trade.inputAmount.raw
        }
      })

      const bestTrade = TradeV2.chooseBestTrade(trades, isExactIn)

      expect(minInputAmount).toStrictEqual(bestTrade.inputAmount.raw)
    })
  })
  describe('TradeV2.getTradesExactIn() and TradeV2.getTradesExactIn()', () => {
    it('generates the same route for the same inputToken / outputToken', async () => {
      const tradesExactIn = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      const tradesExactOut = await TradeV2.getTradesExactOut(
        allRoutes,
        amountOut,
        inputToken,
        false,
        false,
        client,
        CHAIN_ID
      )

      const isExactIn = true
      const bestTradeExactIn = TradeV2.chooseBestTrade(tradesExactIn, isExactIn)
      const bestTradeExactOut = TradeV2.chooseBestTrade(
        tradesExactOut,
        !isExactIn
      )

      expect(bestTradeExactIn.route.path.length).toBe(
        bestTradeExactOut.route.path.length
      )

      if (bestTradeExactIn && bestTradeExactOut) {
        bestTradeExactIn.route.path.forEach((token, i) => {
          const otherRouteToken = bestTradeExactOut.route.path[i]
          expect(token.address).toBe(otherRouteToken.address)
        })
      }
    })
  })
  describe('TradeV2.swapCallParameters()', () => {
    it('generates swapExactTokensForMAS method', async () => {
      const isNativeOut = true

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
      expect(bestTrade?.swapCallParameters(options)?.methodName).toBe(
        'swapExactTokensForMAS'
      )
    })
    it('generates swapExactTokensForTokens method', async () => {
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
      expect(bestTrade?.swapCallParameters(options)?.methodName).toBe(
        'swapExactTokensForTokens'
      )
    })
    it('generates args correctly', async () => {
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

      const args = new Args(params?.args.serialize())

      expect(args.nextU256()).toBe(amountIn.raw)
      expect(args.nextU256()).toBe(
        bestTrade?.minimumAmountOut(options.allowedSlippage).raw
      )
      expect(args.nextArray(ArrayTypes.U64)).toBeInstanceOf(Array)
      expect(args.nextArray(ArrayTypes.STRING)).toBeInstanceOf(Array)
      expect(args.nextString()).toBe(options.recipient)
      expect(args.nextU64()).toBeGreaterThan(0)
    })
  })
})
