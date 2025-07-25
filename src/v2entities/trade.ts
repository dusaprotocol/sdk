import invariant from 'tiny-invariant'
import { RouteV2 } from './route'
import {
  ChainId,
  // LB_QUOTER_ADDRESS,
  V2_LB_QUOTER_ADDRESS as LB_QUOTER_ADDRESS,
  MULTICALL_ADDRESS,
  TradeType
} from '../constants'
import {
  TradeOptions,
  TradeOptionsDeadline,
  TradeFee,
  SwapParameters,
  Quote,
  RouterPathParameters
} from '../types'
import { Args, ArrayTypes, Provider } from '@massalabs/massa-web3'
import {
  CurrencyAmount,
  Fraction,
  Percent,
  Price,
  Token,
  TokenAmount,
  WMAS as _WMAS
} from '../v1entities'
import { IMulticall, IQuoter, Tx } from '../contracts'
import { MassaUnits } from '../constants'

/** Class representing a trade */
export class TradeV2 {
  public readonly tradeType: TradeType // The type of the trade, either exact in or exact out.
  public readonly inputAmount: TokenAmount // The input amount for the trade returned by the quote
  public readonly outputAmount: TokenAmount // The output amount for the trade returned by the quote
  public readonly executionPrice: Price // The price expressed in terms of output amount/input amount.
  public readonly exactQuote: TokenAmount // The exact amount if there was not slippage
  public readonly priceImpact: Percent // The percent difference between the executionPrice and the midPrice due to trade size

  public constructor(
    public readonly route: RouteV2, // The route of the trade, i.e. which pairs the trade goes through.
    tokenIn: Token,
    tokenOut: Token,
    public readonly quote: Quote, // quote returned by the LBQuoter contract
    isExactIn: boolean,
    public readonly isNativeIn: boolean,
    public readonly isNativeOut: boolean
  ) {
    const inputAmount = new TokenAmount(tokenIn, quote.amounts[0])
    const outputAmount = new TokenAmount(
      tokenOut,
      quote.amounts[quote.amounts.length - 1]
    )

    this.tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    this.isNativeOut = isNativeOut
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.raw,
      this.outputAmount.raw
    )

    // compute exactQuote and priceImpact
    if (isExactIn) {
      const exactQuoteStr =
        quote.virtualAmountsWithoutSlippage[
          quote.virtualAmountsWithoutSlippage.length - 1
        ].toString()
      this.exactQuote = new TokenAmount(tokenOut, exactQuoteStr)
      const slippage = this.exactQuote
        .subtract(outputAmount)
        .divide(this.exactQuote)
      this.priceImpact = new Percent(slippage.numerator, slippage.denominator)
    } else {
      const exactQuoteStr = quote.virtualAmountsWithoutSlippage[0].toString()
      this.exactQuote = new TokenAmount(tokenIn, exactQuoteStr)
      const slippage = inputAmount.subtract(this.exactQuote).divide(inputAmount)
      this.priceImpact = new Percent(slippage.numerator, slippage.denominator)
    }
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   *
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   * @returns {CurrencyAmount}
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(0n), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    } else {
      const slippageAdjustedAmountOut = new Fraction(1n)
        .add(slippageTolerance)
        .invert()
        .multiply(this.outputAmount.raw).quotient
      const chainId = this.outputAmount.token.chainId
      return this.outputAmount instanceof TokenAmount
        ? new TokenAmount(this.outputAmount.token, slippageAdjustedAmountOut)
        : CurrencyAmount.ether(chainId, slippageAdjustedAmountOut)
    }
  }

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   *
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   * @returns {CurrencyAmount}
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount {
    invariant(!slippageTolerance.lessThan(0n), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    } else {
      const slippageAdjustedAmountIn = new Fraction(1n)
        .add(slippageTolerance)
        .multiply(this.inputAmount.raw).quotient
      const chainId = this.outputAmount.token.chainId
      return this.inputAmount instanceof TokenAmount
        ? new TokenAmount(this.inputAmount.token, slippageAdjustedAmountIn)
        : CurrencyAmount.ether(chainId, slippageAdjustedAmountIn)
    }
  }

  /**
   * Returns the on-chain method name and args for this trade
   *
   * @param {TradeOptions | TradeOptionsDeadline} options
   * @returns {SwapParameters}
   */
  public swapCallParameters(
    options: TradeOptions | TradeOptionsDeadline
  ): SwapParameters {
    const nativeIn = this.isNativeIn
    const nativeOut = this.isNativeOut
    // the router does not support both native in and out
    invariant(!(nativeIn && nativeOut), 'NATIVE_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    const to: string = options.recipient
    const amountIn: bigint = this.maximumAmountIn(options.allowedSlippage).raw
    const amountOut: bigint = this.minimumAmountOut(options.allowedSlippage).raw

    const binSteps: string[] = this.quote.binSteps.map((bin) => bin.toString())
    const path: RouterPathParameters = {
      pairBinSteps: binSteps,
      tokenPath: this.quote.route
    }
    const deadline =
      'ttl' in options
        ? Math.floor(new Date().getTime()) + options.ttl
        : options.deadline

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)

    const SWAP_STORAGE_COST = MassaUnits.oneMassa / 10n // 0.1 MAS

    const { methodName, args, value } = ((
      tradeType: TradeType
    ): SwapParameters => {
      const args = new Args()
      let value = SWAP_STORAGE_COST
      const isV2 = !!this.quote.isLegacy.length
      switch (tradeType) {
        case TradeType.EXACT_INPUT:
          if (nativeIn) {
            const methodName = useFeeOnTransfer
              ? 'swapExactMASForTokensSupportingFeeOnTransferTokens'
              : 'swapExactMASForTokens'
            args.addU256(amountOut).addArray(path.pairBinSteps, ArrayTypes.U64)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addArray(path.tokenPath, ArrayTypes.STRING)
              .addString(to)
              .addU64(BigInt(deadline))
              .addU64(SWAP_STORAGE_COST)
            value += amountIn
            return { args, methodName, value }
          } else if (nativeOut) {
            const methodName = useFeeOnTransfer
              ? 'swapExactTokensForMASSupportingFeeOnTransferTokens'
              : 'swapExactTokensForMAS'
            args
              .addU256(amountIn)
              .addU256(amountOut)
              .addArray(path.pairBinSteps, ArrayTypes.U64)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addArray(path.tokenPath, ArrayTypes.STRING)
              .addString(to)
              .addU64(BigInt(deadline))
            return { args, methodName, value }
          } else {
            const methodName = useFeeOnTransfer
              ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
              : 'swapExactTokensForTokens'
            args
              .addU256(amountIn)
              .addU256(amountOut)
              .addArray(path.pairBinSteps, ArrayTypes.U64)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addArray(path.tokenPath, ArrayTypes.STRING)
              .addString(to)
              .addU64(BigInt(deadline))
            return { args, methodName, value }
          }
        case TradeType.EXACT_OUTPUT:
          invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
          if (nativeIn) {
            const methodName = 'swapMASForExactTokens'
            args
              .addU256(amountOut)
              .addArray(path.pairBinSteps, ArrayTypes.U64)
              .addArray(path.tokenPath, ArrayTypes.STRING)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addString(to)
              .addU64(BigInt(deadline))
              .addU64(SWAP_STORAGE_COST)
            value += amountIn
            return { args, methodName, value }
          } else if (nativeOut) {
            const methodName = 'swapTokensForExactMAS'
            args
              .addU256(amountOut)
              .addU256(amountIn)
              .addArray(path.pairBinSteps, ArrayTypes.U64)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addArray(path.tokenPath, ArrayTypes.STRING)
              .addString(to)
              .addU64(BigInt(deadline))
            return { args, methodName, value }
          } else {
            const methodName = 'swapTokensForExactTokens'
            args
              .addU256(amountOut)
              .addU256(amountIn)
              .addArray(path.pairBinSteps, ArrayTypes.U64)
            if (isV2) args.addArray(this.quote.isLegacy, ArrayTypes.BOOL)
            args
              .addArray(path.tokenPath, ArrayTypes.STRING)
              .addString(to)
              .addU64(BigInt(deadline))
            return { args, methodName, value }
          }
      }
    })(this.tradeType)

    return {
      methodName,
      args,
      value
    }
  }

  /**
   * Calculates trade fee in terms of inputToken
   *
   * @returns {TradeFee}
   */
  public getTradeFee(): TradeFee {
    // amounts for each step of the swap returned from quoter contract
    // e.g. [10 WMAS, 20 USDC, 19.9 USDT ] when inputAmount is 10 WMAS and resulting outputToken is USDT
    const amounts = this.quote.amounts

    // pool fee % for each step of the swap from quoter contract
    // e.g. [WMAS-USDC pool 0.05%, USDC-USDT pool 0.01%]
    const feesPct = this.quote.fees.map((bn) => new Percent(bn, BigInt(1e18)))

    // actual fee amounts paid at each step of the swap; e.g. [0.005 WMAS, 0.002 USDC]
    const fees = feesPct.map((pct, i) => {
      const amount = amounts[i]
      return pct.multiply(amount).quotient
    })

    // change each fees in terms of the inputToken; e.g. [0.005 WMAS, 0.0001 WMAS]
    const feesTokenIn = fees.map((fee, i) => {
      // first fee will always be in terms of inputToken
      if (i === 0) {
        return fee
      }

      const midPrice = new Fraction(amounts[0], amounts[i])
      return midPrice.multiply(fee).quotient
    })

    // sum of all fees; e.g. 0.0051 WMAS
    const totalFee = feesTokenIn.reduce((a, b) => a + b, 0n)

    // get total fee in TokenAmount
    const feeAmountIn = new TokenAmount(this.inputAmount.token, totalFee)

    // get total fee pct; e.g. 0.0051 / 10 * 100 = 0.051%
    const totalFeePct = new Percent(totalFee, this.inputAmount.raw)

    return {
      totalFeePct,
      feeAmountIn
    }
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the input token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountIn
   * @param {Token} tokenOut
   * @param {boolean} isNativeIn
   * @param {boolean} isNativeOut
   * @param {Provider} client
   * @param {ChainId} chainId
   * @param {string} [quoterAddress=LB_QUOTER_ADDRESS]
   * @returns {TradeV2[]}
   */
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    client: Provider,
    chainId: ChainId,
    quoterAddress = LB_QUOTER_ADDRESS[chainId]
  ): Promise<Array<TradeV2 | undefined>> {
    return TradeV2.getTrades(
      true,
      routes,
      tokenAmountIn,
      tokenOut,
      isNativeIn,
      isNativeOut,
      client,
      chainId,
      quoterAddress
    )
  }

  /**
   * @static
   * Returns the list of trades, given a list of routes and a fixed amount of the output token
   *
   * @param {RouteV2[]} routes
   * @param {TokenAmount} tokenAmountOut
   * @param {Token} tokenIn
   * @param {boolean} isNativeIn
   * @param {boolean} isNativeOut
   * @param {Provider} client
   * @param {ChainId} chainId
   * @param {string} [quoterAddress=LB_QUOTER_ADDRESS]
   * @returns {TradeV2[]}
   */
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    client: Provider,
    chainId: ChainId,
    quoterAddress = LB_QUOTER_ADDRESS[chainId]
  ): Promise<Array<TradeV2 | undefined>> {
    return TradeV2.getTrades(
      false,
      routes,
      tokenAmountOut,
      tokenIn,
      isNativeIn,
      isNativeOut,
      client,
      chainId,
      quoterAddress
    )
  }

  private static async getTrades(
    isExactIn: boolean,
    routes: RouteV2[],
    tokenAmount: TokenAmount,
    otherToken: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    client: Provider,
    chainId: ChainId,
    quoterAddress = LB_QUOTER_ADDRESS[chainId]
  ): Promise<(TradeV2 | undefined)[]> {
    const tokenIn = isExactIn ? tokenAmount.token : otherToken
    const tokenOut = isExactIn ? otherToken : tokenAmount.token

    // handle wmas<->mas wrap swaps
    const isWrapSwap =
      (isNativeIn && tokenOut.address === _WMAS[chainId].address) ||
      (isNativeOut && tokenIn.address === _WMAS[chainId].address)
    if (isWrapSwap) return []

    const txs: Tx[] = routes.map((route) => {
      const routeStrArr = route.pathToStrArr()
      return new Tx(
        isExactIn ? 'findBestPathFromAmountIn' : 'findBestPathFromAmountOut',
        new Args()
          .addArray(routeStrArr, ArrayTypes.STRING)
          .addU256(tokenAmount.raw)
          .serialize(),
        quoterAddress
      )
    })

    const quotes: Array<Quote | undefined> = await new IMulticall(
      MULTICALL_ADDRESS[chainId],
      client
    )
      .aggregateMulticall(txs)
      .then((res) => {
        const bs = new Args(res.value)
        return routes.map(() => {
          const r = bs.nextUint8Array()
          if (!r.length) throw new Error('No result')

          return new Quote().deserialize(r).instance
        })
      })
      .catch((err) => {
        console.log('Error fetching quotes:', err.message)
        const quoter = new IQuoter(quoterAddress, client)
        return Promise.all(
          routes.map(async (route) => {
            try {
              const methodName = isExactIn
                ? 'findBestPathFromAmountIn'
                : 'findBestPathFromAmountOut'
              const quote: Quote = await quoter[methodName](
                route.pathToStrArr(),
                tokenAmount.raw.toString()
              )
              return quote
            } catch (e) {
              console.log('Error fetching quote:', e)
              return undefined
            }
          })
        )
      })

    const trades: Array<TradeV2 | undefined> = quotes.map((quote, i) => {
      try {
        if (!quote) return undefined
        const trade: TradeV2 = new TradeV2(
          routes[i],
          tokenIn,
          tokenOut,
          quote,
          isExactIn,
          isNativeIn,
          isNativeOut
        )
        return trade
      } catch (e) {
        console.log('Error:', e)
        return undefined
      }
    })

    return trades.filter((trade) => !!trade && trade.outputAmount.raw > 0n)
  }

  /**
   * @static
   * Returns the best trade
   *
   * @param {(TradeV2 | undefined)[]} trades
   * @param {boolean} isExactIn
   * @returns {TradeV2}
   */
  public static chooseBestTrade(
    trades: (TradeV2 | undefined)[],
    isExactIn: boolean
  ): TradeV2 {
    if (trades.length === 0 || trades[0] === undefined) {
      throw new Error('No trades')
    }

    let bestTrade = trades[0]

    trades.forEach((trade) => {
      if (!trade) return

      if (isExactIn) {
        if (trade.outputAmount.raw > bestTrade.outputAmount.raw) {
          bestTrade = trade
        }
      } else {
        if (
          trade.inputAmount.raw > 0n &&
          (bestTrade.inputAmount.raw === 0n ||
            trade.inputAmount.raw < bestTrade.inputAmount.raw)
        ) {
          bestTrade = trade
        }
      }
    })
    return bestTrade
  }

  /**
   * Returns an object representing this trade for a readable console.log
   *
   * @returns {Object}
   */
  public toLog() {
    return {
      route: {
        path: this.route.path
          .map((token) => `${token.name}(${token.address})`)
          .join(', ')
      },
      tradeType:
        this.tradeType === TradeType.EXACT_INPUT
          ? 'EXACT_INPUT'
          : 'EXACT_OUTPUT',
      inputAmount: `${this.inputAmount.toSignificant(6)} ${
        this.inputAmount.currency.symbol
      }`,
      outputAmount: `${this.outputAmount.toSignificant(6)} ${
        this.outputAmount.currency.symbol
      }`,
      executionPrice: `${this.executionPrice.toSignificant(6)} ${
        this.outputAmount.currency.symbol
      } / ${this.inputAmount.currency.symbol}`,
      exactQuote: `${this.exactQuote.toSignificant(6)} ${
        this.exactQuote.currency.symbol
      }`,
      priceImpact: `${this.priceImpact.toSignificant(6)}%`,
      quote: {
        route: this.quote.route.join(', '),
        pairs: this.quote.pairs.join(', '),
        binSteps: this.quote.binSteps.map((el) => el.toString()).join(', '),
        amounts: this.quote.amounts.map((el) => el.toString()).join(', '),
        fees: this.quote.fees.map((el) => el.toString()).join(', '),
        virtualAmountsWithoutSlippage: this.quote.virtualAmountsWithoutSlippage
          .map((el) => el.toString())
          .join(', '),
        isLegacy: this.quote.isLegacy.map((el) => el.toString()).join(', ')
      }
    }
  }
}
