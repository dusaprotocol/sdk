import invariant from 'tiny-invariant'
import { Token } from './token'
import { Price, TokenAmount } from './fractions'
import { BigintIsh, ChainId, MINIMUM_LIQUIDITY } from '../constants'
import { parseBigintIsh } from 'lib/ethers'

const sqrt = (y: bigint): bigint => {
  let z = 0n
  if (y > 3n) {
    z = y
    let x = y / 2n + 1n
    while (x < z) {
      z = x
      x = (y / x + x) / 2n
    }
  } else if (y != 0n) {
    z = 1n
  }
  return z
}

export class Pair {
  public readonly liquidityToken: Token
  private readonly tokenAmounts: [TokenAmount, TokenAmount]

  public constructor(
    tokenAmountA: TokenAmount,
    tokenAmountB: TokenAmount,
    chainId: ChainId
  ) {
    const tokenAmounts =
      tokenAmountA.token < tokenAmountB.token // does safety checks
        ? [tokenAmountA, tokenAmountB]
        : [tokenAmountB, tokenAmountA]
    this.liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token, chainId),
      18,
      'DLP',
      'Dusa Liquidity'
    )
    this.tokenAmounts = tokenAmounts as [TokenAmount, TokenAmount]
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  public get token0Price(): Price {
    return new Price(
      this.token0,
      this.token1,
      this.tokenAmounts[0].raw,
      this.tokenAmounts[1].raw
    )
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  public get token1Price(): Price {
    return new Price(
      this.token1,
      this.token0,
      this.tokenAmounts[1].raw,
      this.tokenAmounts[0].raw
    )
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  public priceOf(token: Token): Price {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.token0Price : this.token1Price
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  public get chainId(): ChainId {
    return this.token0.chainId
  }

  public get token0(): Token {
    return this.tokenAmounts[0].token
  }

  public get token1(): Token {
    return this.tokenAmounts[1].token
  }

  public get reserve0(): TokenAmount {
    return this.tokenAmounts[0]
  }

  public get reserve1(): TokenAmount {
    return this.tokenAmounts[1]
  }

  public reserveOf(token: Token): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.reserve0 : this.reserve1
  }

  public getOutputAmount(
    inputAmount: TokenAmount,
    chainId: ChainId
  ): [TokenAmount, Pair] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (this.reserve0.raw === 0n || this.reserve1.raw === 0n) {
      throw Error('InsufficientReserves')
    }
    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0
    )
    const inputAmountWithFee = inputAmount.raw * 997n
    const numerator = inputAmountWithFee * outputReserve.raw
    const denominator = inputReserve.raw * 1000n + inputAmountWithFee
    const outputAmount = new TokenAmount(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      numerator / denominator
    )
    if (outputAmount.raw === 0n) {
      throw new Error('InsufficientInputAmount')
    }
    return [
      outputAmount,
      new Pair(
        inputReserve.add(inputAmount),
        outputReserve.subtract(outputAmount),
        chainId
      )
    ]
  }

  public getInputAmount(
    outputAmount: TokenAmount,
    chainId: ChainId
  ): [TokenAmount, Pair] {
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (
      this.reserve0.raw === 0n ||
      this.reserve1.raw === 0n ||
      outputAmount.raw >= this.reserveOf(outputAmount.token).raw
    ) {
      throw new Error('InsufficientReserves')
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(
      outputAmount.token.equals(this.token0) ? this.token1 : this.token0
    )
    const numerator = (inputReserve.raw * outputAmount.raw, 1000n)
    const denominator = (outputReserve.raw - outputAmount.raw) * 997n
    const inputAmount = new TokenAmount(
      outputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      numerator / denominator + 1n
    )
    return [
      inputAmount,
      new Pair(
        inputReserve.add(inputAmount),
        outputReserve.subtract(outputAmount),
        chainId
      )
    ]
  }

  public getLiquidityMinted(
    totalSupply: TokenAmount,
    tokenAmountA: TokenAmount,
    tokenAmountB: TokenAmount
  ): TokenAmount {
    invariant(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY')
    const tokenAmounts =
      tokenAmountA.token < tokenAmountB.token // does safety checks
        ? [tokenAmountA, tokenAmountB]
        : [tokenAmountB, tokenAmountA]
    invariant(
      tokenAmounts[0].token.equals(this.token0) &&
        tokenAmounts[1].token.equals(this.token1),
      'TOKEN'
    )

    let liquidity: bigint
    if (totalSupply.raw === 0n) {
      liquidity =
        sqrt(tokenAmounts[0].raw * tokenAmounts[1].raw) - MINIMUM_LIQUIDITY
    } else {
      const amount0 =
        (tokenAmounts[0].raw * totalSupply.raw) / this.reserve0.raw
      const amount1 =
        (tokenAmounts[1].raw * totalSupply.raw) / this.reserve1.raw
      liquidity = amount0 <= amount1 ? amount0 : amount1
    }
    if (!(liquidity >= 0n)) {
      throw new Error('InsufficientInputAmount')
    }
    return new TokenAmount(this.liquidityToken, liquidity)
  }

  public getLiquidityValue(
    token: Token,
    totalSupply: TokenAmount,
    liquidity: TokenAmount,
    feeOn: boolean = false,
    kLast?: BigintIsh
  ): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    invariant(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY')
    invariant(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY')
    invariant(liquidity.raw <= totalSupply.raw, 'LIQUIDITY')

    let totalSupplyAdjusted: TokenAmount
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply
    } else {
      invariant(!!kLast, 'K_LAST')
      const kLastParsed = parseBigintIsh(kLast)
      if (!(kLastParsed === 0n)) {
        const rootK = sqrt(this.reserve0.raw * this.reserve1.raw)
        const rootKLast = sqrt(kLastParsed)
        if (rootK > rootKLast) {
          const numerator = totalSupply.raw * (rootK - rootKLast)
          const denominator = rootK * 5n + rootKLast
          const feeLiquidity = numerator / denominator
          totalSupplyAdjusted = totalSupply.add(
            new TokenAmount(this.liquidityToken, feeLiquidity)
          )
        } else {
          totalSupplyAdjusted = totalSupply
        }
      } else {
        totalSupplyAdjusted = totalSupply
      }
    }

    return new TokenAmount(
      token,
      (liquidity.raw * this.reserveOf(token).raw) / totalSupplyAdjusted.raw
    )
  }
}
