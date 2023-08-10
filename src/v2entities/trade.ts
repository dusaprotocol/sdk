import invariant from 'tiny-invariant'
import { RouteV2 } from './route'
import { ChainId, LB_QUOTER_ADDRESS, TradeType, ZERO_HEX } from '../constants'
import {
  TradeOptions,
  TradeOptionsDeadline,
  TradeFee,
  SwapParameters,
  Quote,
  RouterPathParameters,
  Address
} from '../types'
import { Args, ArrayType, Client } from '@massalabs/massa-web3'
import {
  CurrencyAmount,
  Fraction,
  Percent,
  Price,
  Token,
  TokenAmount,
  WMAS as _WMAS
} from '../v1entities'
import { IQuoter } from '../contracts'

/** Class representing a trade */
export class TradeV2 {
  public readonly quote: Quote // quote returned by the LBQuoter contract
  public readonly route: RouteV2 // The route of the trade, i.e. which pairs the trade goes through.
  public readonly tradeType: TradeType // The type of the trade, either exact in or exact out.
  public readonly inputAmount: TokenAmount // The input amount for the trade returned by the quote
  public readonly outputAmount: TokenAmount // The output amount for the trade returned by the quote
  public readonly executionPrice: Price // The price expressed in terms of output amount/input amount.
  public readonly exactQuote: TokenAmount // The exact amount if there was not slippage
  public readonly priceImpact: Percent // The percent difference between the executionPrice and the midPrice due to trade size
  public readonly isNativeIn: boolean
  public readonly isNativeOut: boolean

  public constructor(
    route: RouteV2,
    tokenIn: Token,
    tokenOut: Token,
    quote: Quote,
    isExactIn: boolean,
    isNativeIn: boolean,
    isNativeOut: boolean
  ) {
    const inputAmount = new TokenAmount(tokenIn, quote.amounts[0])
    const outputAmount = new TokenAmount(
      tokenOut,
      quote.amounts[quote.amounts.length - 1]
    )

    this.route = route
    this.tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
    this.quote = quote
    this.isNativeIn = isNativeIn
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
    const amountIn: string = this.maximumAmountIn(
      options.allowedSlippage
    ).raw.toString()
    const amountOut: string = this.minimumAmountOut(
      options.allowedSlippage
    ).raw.toString()

    const binSteps: string[] = this.quote.binSteps.map((bin) => bin.toString())
    const path: RouterPathParameters = {
      pairBinSteps: binSteps,
      tokenPath: this.quote.route.map((t) => new Address(t))
    }
    const deadline =
      'ttl' in options
        ? Math.floor(new Date().getTime()) + options.ttl
        : options.deadline

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)

    let methodName = ''
    const args: Args = new Args()
    let value = ''
    switch (this.tradeType) {
      case TradeType.EXACT_INPUT:
        if (nativeIn) {
          methodName = useFeeOnTransfer
            ? 'swapExactNATIVEForTokensSupportingFeeOnTransferTokens'
            : 'swapExactNATIVEForTokens'
          args
            .addU64(BigInt(amountOut))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = amountIn
        } else if (nativeOut) {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForNATIVESupportingFeeOnTransferTokens'
            : 'swapExactTokensForNATIVE'
          args
            .addU64(BigInt(amountIn))
            .addU64(BigInt(amountOut))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = ZERO_HEX
        } else {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            : 'swapExactTokensForTokens'
          args
            .addU64(BigInt(amountIn))
            .addU64(BigInt(amountOut))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (nativeIn) {
          methodName = 'swapNATIVEForExactTokens'
          args
            .addU64(BigInt(amountOut))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = amountIn
        } else if (nativeOut) {
          methodName = 'swapTokensForExactNATIVE'
          args
            .addU64(BigInt(amountOut))
            .addU64(BigInt(amountIn))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          args
            .addU64(BigInt(amountOut))
            .addU64(BigInt(amountIn))
            .addArray(path.pairBinSteps, ArrayType.U64)
            .addSerializableObjectArray(path.tokenPath)
            .addString(to)
            .addU64(BigInt(deadline))
          value = ZERO_HEX
        }
        break
    }
    return {
      methodName,
      args: args.serialize(),
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
    const feesPct = this.quote.fees.map((bn) => new Percent(bn, 10n ** 9n))

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
   * @param {Client} client
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactIn(
    routes: RouteV2[],
    tokenAmountIn: TokenAmount,
    tokenOut: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    client: Client,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = true

    // handle wnative<->native wrap swaps
    const isWrapSwap =
      (isNativeIn && tokenOut.address === _WMAS[chainId].address) ||
      (isNativeOut && tokenAmountIn.token.address === _WMAS[chainId].address)

    if (isWrapSwap) {
      return []
    }

    const amountIn = tokenAmountIn.raw.toString()

    const quoter = new IQuoter(LB_QUOTER_ADDRESS[chainId], client)

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathFromAmountIn(
            routeStrArr,
            amountIn
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenAmountIn.token,
            tokenOut,
            quote,
            isExactIn,
            isNativeIn,
            isNativeOut
          )
          return trade
        } catch (e) {
          console.debug('Error fetching quote:', e)
          return undefined
        }
      })
    )

    return trades.filter((trade) => !!trade && trade.outputAmount.raw > 0n)
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
   * @param {Client} client
   * @param {ChainId} chainId
   * @returns {TradeV2[]}
   */
  public static async getTradesExactOut(
    routes: RouteV2[],
    tokenAmountOut: TokenAmount,
    tokenIn: Token,
    isNativeIn: boolean,
    isNativeOut: boolean,
    client: Client,
    chainId: ChainId
  ): Promise<Array<TradeV2 | undefined>> {
    const isExactIn = false

    // handle wmas<->mas wrap swaps
    const isWrapSwap =
      (isNativeIn && tokenAmountOut.token.address === _WMAS[chainId].address) ||
      (isNativeOut && tokenIn.address === _WMAS[chainId].address)

    if (isWrapSwap) {
      return []
    }

    const amountOut = tokenAmountOut.raw.toString()

    const quoter = new IQuoter(LB_QUOTER_ADDRESS[chainId], client)

    const trades: Array<TradeV2 | undefined> = await Promise.all(
      routes.map(async (route) => {
        try {
          const routeStrArr = route.pathToStrArr()
          const quote: Quote = await quoter.findBestPathFromAmountOut(
            routeStrArr,
            amountOut
          )
          const trade: TradeV2 = new TradeV2(
            route,
            tokenAmountOut.token,
            tokenIn,
            quote,
            isExactIn,
            isNativeIn,
            isNativeOut
          )
          return trade
        } catch (e) {
          console.debug('Error fetching quote:', e)
          return undefined
        }
      })
    )

    return trades.filter((trade) => !!trade && trade.outputAmount.raw > 0n)
  }

  /**
   * @static
   * Returns the best trade
   *
   * @param {TradeV2[]} trades
   * @param {boolean} isExactIn
   * @returns {TradeV2}
   */
  public static chooseBestTrade(
    trades: TradeV2[],
    isExactIn: boolean
  ): TradeV2 {
    if (trades.length === 0) {
      throw new Error('No trades')
    }

    let bestTrade = trades[0]

    trades.forEach((trade) => {
      if (isExactIn) {
        if (trade.outputAmount.raw > bestTrade.outputAmount.raw) {
          bestTrade = trade
        }
      } else {
        if (
          trade.inputAmount.raw > 0n &&
          trade.inputAmount.raw < bestTrade.inputAmount.raw
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
          .join(', ')
      }
    }
  }
}
