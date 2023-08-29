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
import { ChainId, LB_FACTORY_ADDRESS } from '../constants'
import {
  ClientFactory,
  DefaultProviderUrls,
  ProviderType
} from '@massalabs/massa-web3'
import { IFactory, ILBPair } from '../contracts'

describe('TradeV2 entity', async () => {
  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
  const CHAIN_ID = ChainId.BUILDNET
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    true
  )

  // init tokens and route bases
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]
  const BASES = [WMAS, USDC, WETH]

  // init input / output
  const inputToken = USDC
  const outputToken = WETH
  const binStep = 10

  const factory = new IFactory(LB_FACTORY_ADDRESS[CHAIN_ID], client)
  const lbPairAddress = (
    await factory.getLBPairInformation(
      inputToken.address,
      outputToken.address,
      binStep
    )
  ).LBPair
  const lbPairContract = new ILBPair(lbPairAddress, client)

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
    2
  )

  // user input for exactIn trade
  const typedValueIn = '4'
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString()

  const amountIn = new TokenAmount(inputToken, typedValueInParsed)

  // user input for exactOut trade
  const typedValueOut = '0.2'
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
    // it('calculates price impact correctly', async () => {
    //   const reserves = await lbPairContract.getReservesAndId()
    //   const amountOut = new TokenAmount(
    //     outputToken,
    //     BigInt(
    //       inputToken.sortsBefore(outputToken)
    //         ? reserves.reserveY
    //         : reserves.reserveX
    //     )
    //   )

    //   const trades = await TradeV2.getTradesExactOut(
    //     allRoutes,
    //     amountOut,
    //     inputToken,
    //     false,
    //     false,
    //     client,
    //     CHAIN_ID
    //   )

    //   if (!trades[0]) {
    //     throw new Error('No trades')
    //   }

    //   expect(Number(trades[0].priceImpact.toFixed(2))).toBeGreaterThan(5)
    // })
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

      let minInputAmount = (trades[0] as TradeV2).inputAmount.raw

      trades.forEach((trade) => {
        if (trade) {
          if (trade.inputAmount.raw < minInputAmount) {
            minInputAmount = trade.inputAmount.raw
          }
        }
      })

      const bestTrade = TradeV2.chooseBestTrade(trades, isExactIn)

      expect(minInputAmount === (bestTrade as TradeV2).inputAmount.raw).toBe(
        true
      )
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

      expect((bestTradeExactIn as TradeV2).route.path.length).toBe(
        (bestTradeExactOut as TradeV2).route.path.length
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
  })
})
