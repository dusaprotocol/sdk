import {
  LiquidityDistribution,
  BinReserves,
  LBPair,
  AddLiquidityParameters,
  RemoveLiquidityParameters,
  LiquidityParameters
} from '../types'
import { ChainId, LB_FACTORY_ADDRESS } from '../constants'
import { Bin } from './bin'
import { getLiquidityConfig } from '../utils/liquidityDistribution'
import { Fraction, Percent, Token, TokenAmount } from '../v1entities'
import { Args, ArrayTypes, Client, MassaUnits } from '@massalabs/massa-web3'
import { IFactory } from '../contracts'
import invariant from 'tiny-invariant'

/** Class representing a pair of tokens. */
export class PairV2 {
  public readonly token0: Token
  public readonly token1: Token

  public constructor(tokenA: Token, tokenB: Token) {
    if (tokenA.sortsBefore(tokenB)) {
      this.token0 = tokenA
      this.token1 = tokenB
    } else {
      this.token0 = tokenB
      this.token1 = tokenA
    }
  }

  /**
   * Returns all available LBPairs for this pair
   *
   * @param {Client} client
   * @param {ChainId} chainId
   * @returns {Promise<LBPair[]>}
   */
  public async fetchAvailableLBPairs(
    client: Client,
    chainId: ChainId
  ): Promise<LBPair[]> {
    const factory = new IFactory(LB_FACTORY_ADDRESS[chainId], client)

    const LBPairs: LBPair[] = await factory.getAllLBPairs(
      this.token0.address,
      this.token1.address
    )
    return LBPairs
  }

  /**
   * Fetches LBPair for token0, token1, and given binStep
   *
   * @param {number} binStep
   * @param {Client} client
   * @param {ChainId} chainId
   * @returns {Promise<LBPair>}
   */
  public async fetchLBPair(
    binStep: number,
    client: Client,
    chainId: ChainId
  ): Promise<LBPair> {
    const factory = new IFactory(LB_FACTORY_ADDRESS[chainId], client)
    const LBPair: LBPair = await factory.getLBPairInformation(
      this.token0.address,
      this.token1.address,
      binStep
    )
    return LBPair
  }

  /**
   * Checks whether this pair equals to that provided in the param
   *
   * @param {PairV2} pair
   * @returns {boolean} true if equal, otherwise false
   */
  public equals(pair: PairV2): boolean {
    if (
      this.token0.address === pair.token0.address &&
      this.token1.address === pair.token1.address
    ) {
      return true
    }
    return false
  }

  /**
   * @static
   * Returns all possible combination of token pairs
   *
   * @param {Token} inputToken
   * @param {Token} outputToken
   * @param {Token[]} bases
   * @returns {[Token, Token][]}
   */
  public static createAllTokenPairs(
    inputToken: Token,
    outputToken: Token,
    bases: Token[]
  ): [Token, Token][] {
    const basePairs = bases
      .flatMap((base: Token) => bases.map((otherBase) => [base, otherBase]))
      .filter(([t0, t1]) => t0.address !== t1.address)

    const allTokenPairs: [Token, Token][] = [
      // the direct pair
      [inputToken, outputToken],
      // token A against all bases
      ...bases.map((base: Token) => [inputToken, base]),
      // token B against all bases
      ...bases.map((base: Token) => [outputToken, base]),
      // each base against all bases
      ...basePairs
    ]
      .filter((tokens): tokens is [Token, Token] =>
        Boolean(tokens[0] && tokens[1])
      )
      .filter(([t0, t1]) => t0.address !== t1.address)

    return allTokenPairs
  }

  /**
   * @static
   * Returns the initialized pairs given a list of token pairs
   *
   * @param {[Token, Token][]} tokenPairs
   * @returns {PairV2[]}
   */
  public static initPairs(tokenPairs: [Token, Token][]): PairV2[] {
    const allPairs = tokenPairs.map((tokenPair: Token[]) => {
      return new PairV2(tokenPair[0], tokenPair[1])
    })

    const uniquePairs: PairV2[] = []
    allPairs.forEach((pair: PairV2) => {
      if (!uniquePairs.some((pair2: PairV2) => pair.equals(pair2))) {
        uniquePairs.push(pair)
      }
    })

    return uniquePairs
  }

  /**
   * Calculate amountX and amountY
   *
   * @param {number[]} binIds
   * @param {number[]} activeBin
   * @param {BinReserves[]} bins
   * @param {bigint[]} totalSupplies
   * @param {string[]} liquidity
   * @returns
   */
  public static calculateAmounts(
    binIds: number[],
    activeBin: number,
    bins: BinReserves[],
    totalSupplies: bigint[],
    liquidity: string[]
  ): {
    amountX: bigint
    amountY: bigint
  } {
    // calculate expected total to remove for X and Y
    let totalAmountX = 0n
    let totalAmountY = 0n

    binIds.forEach((binId, i) => {
      // get totalSupply, reserveX, and reserveY for the bin
      const { reserveX, reserveY } = bins[i]
      const totalSupply = totalSupplies[i]
      const liquidityAmount = BigInt(liquidity[i])

      // increment totalAmountX and/or totalAmountY
      if (binId <= activeBin) {
        const amountY = (liquidityAmount * reserveY) / totalSupply
        totalAmountY = amountY + totalAmountY
      }

      if (binId >= activeBin) {
        const amountX = (liquidityAmount * reserveX) / totalSupply
        totalAmountX = amountX + totalAmountX
      }
    })

    return {
      amountX: totalAmountX,
      amountY: totalAmountY
    }
  }

  /**
   * Returns the amount and distribution args for on-chain addLiquidity() method
   *
   * @param binStep
   * @param token0Amount
   * @param token1Amount
   * @param amountSlippage
   * @param priceSlippage
   * @param liquidityDistribution
   * @returns
   */
  public addLiquidityParameters(
    binStep: number,
    token0Amount: TokenAmount,
    token1Amount: TokenAmount,
    amountSlippage: Percent,
    priceSlippage: Percent,
    liquidityDistribution: LiquidityDistribution
  ): Omit<AddLiquidityParameters, 'to' | 'deadline' | 'activeIdDesired'> {
    const token0isX = token0Amount.token.sortsBefore(token1Amount.token)
    const token0 = (token0isX ? token0Amount : token1Amount).token.address
    const token1 = (token0isX ? token1Amount : token0Amount).token.address
    const amount0: bigint = token0isX ? token0Amount.raw : token1Amount.raw
    const amount1: bigint = token0isX ? token1Amount.raw : token0Amount.raw

    const amount0Min = new Fraction(1n)
      .add(amountSlippage)
      .invert()
      .multiply(amount0).quotient
    const amount1Min = new Fraction(1n)
      .add(amountSlippage)
      .invert()
      .multiply(amount1).quotient

    const _priceSlippage: number = Number(priceSlippage.toSignificant()) / 100
    const idSlippage = Bin.getIdSlippageFromPriceSlippage(
      _priceSlippage,
      binStep
    )

    const { deltaIds, distributionX, distributionY } = getLiquidityConfig(
      liquidityDistribution
    )

    return {
      token0,
      token1,
      binStep,
      amount0,
      amount1,
      amount0Min,
      amount1Min,
      idSlippage,
      deltaIds,
      distributionX,
      distributionY
    }
  }

  /**
   * Calculates amountX, amountY, amountXMin, and amountYMin needed for on-chain removeLiquidity() method
   *
   * @param {number[]} userPositionIds - List of binIds that user has position
   * @param {number} activeBin - The active bin id for the LBPair
   * @param {Bin[]} bins - List of bins whose indices match those of userPositionIds
   * @param {bigint[]} totalSupplies - List of bin's total supplies whose indices match those of userPositionIds
   * @param {string[]} amountsToRemove - List of amounts specified by the user to remove in each of their position
   * @param {Percent} amountSlippage - The amounts slippage used to calculate amountXMin and amountYMin
   * @returns
   */
  public calculateAmountsToRemove(
    userPositionIds: number[],
    activeBin: number,
    bins: BinReserves[],
    totalSupplies: bigint[],
    amountsToRemove: string[],
    amountSlippage: Percent
  ): {
    amountX: bigint
    amountY: bigint
    amountXMin: bigint
    amountYMin: bigint
  } {
    // calculate expected total to remove for X and Y
    const { amountX, amountY } = PairV2.calculateAmounts(
      userPositionIds,
      activeBin,
      bins,
      totalSupplies,
      amountsToRemove
    )

    // compute min amounts taking into consideration slippage
    const amountXMin = new Fraction(1n)
      .add(amountSlippage)
      .invert()
      .multiply(amountX).quotient

    const amountYMin = new Fraction(1n)
      .add(amountSlippage)
      .invert()
      .multiply(amountY).quotient

    // return
    return {
      amountX,
      amountY,
      amountXMin,
      amountYMin
    }
  }

  /**
   * Returns the on-chain method name and args for this add/remove
   *
   * @param {AddLiquidityParameters | RemoveLiquidityParameters} options
   * @returns {LiquidityParameters}
   */
  public liquidityCallParameters(
    options: AddLiquidityParameters | RemoveLiquidityParameters
  ): LiquidityParameters {
    const isAdd = 'distributionX' in options
    const isNative = this.token0.isNative || this.token1.isNative

    const { to, deadline } = options

    const { methodName, args, value } = ((
      isAdd: boolean
    ): LiquidityParameters => {
      const args: Args = new Args()
      let value = 0n
      switch (isAdd) {
        case true:
          invariant('distributionX' in options, 'INVALID')
          args
            .addString(this.token0.address)
            .addString(this.token1.address)
            .addU64(BigInt(options.binStep))
            .addU256(options.amount0)
            .addU256(options.amount1)
            .addU256(options.amount0Min)
            .addU256(options.amount1Min)
            .addU64(BigInt(options.activeIdDesired))
            .addU64(BigInt(options.idSlippage))
            .addArray(options.deltaIds.map(BigInt), ArrayTypes.I64)
            .addArray(options.distributionX, ArrayTypes.U256)
            .addArray(options.distributionY, ArrayTypes.U256)
            .addString(to)
            .addU64(BigInt(deadline))

          const STORAGE_COST = MassaUnits.oneMassa / 2n // 0.5 MAS
          value += STORAGE_COST
          if (isNative) {
            args.addU64(STORAGE_COST)
            value += this.token0.isNative ? options.amount0 : options.amount1
          }

          return {
            args,
            methodName: isNative ? 'addLiquidityMAS' : 'addLiquidity',
            value
          }
        case false:
          invariant(!('distributionX' in options), 'INVALID')
          if (!isNative) args.addString(this.token0.address)
          args
            .addString(this.token1.address)
            .addU32(options.binStep)
            .addU256(options.amount0Min)
            .addU256(options.amount1Min)
            .addArray(options.ids.map(BigInt), ArrayTypes.U64)
            .addArray(options.amounts, ArrayTypes.U256)
            .addString(to)
            .addU64(BigInt(deadline))

          return {
            args,
            methodName: isNative ? 'removeLiquidityMAS' : 'removeLiquidity',
            value: MassaUnits.oneMassa / 10n // 0.1 MAS
          }
      }
    })(isAdd)

    return {
      methodName,
      args,
      value
    }
  }
}
