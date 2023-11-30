import { CurrencyAmount } from '../v1entities'
import { Big } from 'big.js'
import { spotUniform, curve, bidAsk } from '../constants'
import {
  LiquidityDistribution,
  LiquidityDistributionParams
} from '../types/pair'
import { parseEther } from '../lib/ethers'

/**
 * Returns distribution params for on-chain addLiquidity() call
 * 
 * @param {LiquidityDistribution} distribution 
 * @returns {LiquidityDistributionParams}
}
 */
export const getLiquidityConfig = (
  distribution: LiquidityDistribution
): LiquidityDistributionParams => {
  switch (distribution) {
    case LiquidityDistribution.SPOT:
      return spotUniform
    case LiquidityDistribution.CURVE:
      return curve
    case LiquidityDistribution.BID_ASK:
      return bidAsk
  }
}

/**
 * Returns distribution params for on-chain addLiquidity() call when liquidity is focused at a target bin
 * @param {number} activeId
 * @param {number} targetBin
 * @returns {LiquidityDistributionParams}
 */
export const getDistributionFromTargetBin = (
  activeId: number,
  targetBin: number
): LiquidityDistributionParams => {
  return {
    deltaIds: [targetBin - activeId],
    distributionX:
      targetBin >= activeId ? [parseEther('1')] : [parseEther('0')],
    distributionY: targetBin <= activeId ? [parseEther('1')] : [parseEther('0')]
  }
}

/**
 * Returns normalized array, e.g. normalize so array sums to 1e18 within 1e5 precision
 * @param dist
 * @param sumTo
 * @param precision
 * @returns
 */
export const normalizeDist = (
  dist: bigint[],
  sumTo: bigint,
  precision: bigint
): bigint[] => {
  const sumDist = dist.reduce((sum, cur) => sum + cur, BigInt(0))
  if (sumDist === BigInt(0)) {
    return dist
  }
  const factor = (sumDist * precision) / sumTo
  const normalized = dist.map((d) => (d * precision) / factor)
  return normalized
}

/**
 * Returns distribution params for on-chain addLiquidity() call when liquidity is focused at a custom range of bins
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @returns
 */
export const getUniformDistributionFromBinRange = (
  activeId: number,
  binRange: number[]
): LiquidityDistributionParams => {
  const ONE = BigInt(10) ** BigInt(18)

  const deltaIds: number[] = []
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []

  let nb_x = BigInt(0)
  let nb_y = BigInt(0)

  for (let binId = binRange[0]; binId <= binRange[1]; binId++) {
    if (binId > activeId) {
      nb_x += BigInt(2)
    } else if (binId < activeId) {
      nb_y += BigInt(2)
    } else {
      nb_x += BigInt(1)
      nb_y += BigInt(1)
    }
  }

  for (let binId = binRange[0]; binId <= binRange[1]; binId++) {
    if (binId > activeId) {
      distributionX.push((BigInt(2) * ONE) / nb_x)
      distributionY.push(BigInt(0))
    } else if (binId < activeId) {
      distributionX.push(BigInt(0))
      distributionY.push((BigInt(2) * ONE) / nb_y)
    } else {
      distributionX.push(ONE / nb_x)
      distributionY.push(ONE / nb_y)
    }
    deltaIds.push(binId - activeId)
  }

  return {
    deltaIds,
    distributionX,
    distributionY
  }
}

/**
 * Returns Bid-Ask distribution params for custom bin range
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @param {CurrencyAmount[]} parsedAmounts
 * @returns
 */
export const getBidAskDistributionFromBinRange = (
  activeId: number,
  binRange: number[],
  parsedAmounts: CurrencyAmount[]
): LiquidityDistributionParams => {
  const [parsedAmountA, parsedAmountB] = parsedAmounts

  const deltaIds: number[] = []
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []

  let nb_x = 0
  let nb_y = 0
  for (let binId = binRange[0]; binId <= binRange[1]; binId++) {
    const weight = Math.abs(binId - activeId) + 1

    if (binId >= activeId) {
      nb_x += 2 * weight
    }
    if (binId <= activeId) {
      nb_y += 2 * weight
    }
    if (binId === activeId) {
      if (parsedAmountB.greaterThan('0')) {
        nb_x -= weight
      }
      if (parsedAmountA.greaterThan('0')) {
        nb_y -= weight
      }
    }
  }

  for (let binId = binRange[0]; binId <= binRange[1]; binId++) {
    let dist_x = BigInt(0)
    let dist_y = BigInt(0)

    const weight = parseEther(`${Math.abs(binId - activeId) + 1}`)

    if (binId >= activeId && parsedAmountA.greaterThan('0')) {
      dist_x = (BigInt(2) * weight) / BigInt(nb_x)
    }

    if (binId <= activeId && parsedAmountB.greaterThan('0')) {
      dist_y = (BigInt(2) * weight) / BigInt(nb_y)
    }

    if (
      binId === activeId &&
      parsedAmountA.greaterThan('0') &&
      parsedAmountB.greaterThan('0')
    ) {
      dist_x /= BigInt(2)
      dist_y /= BigInt(2)
    }

    if (dist_x > 0 || dist_y > 0) {
      distributionX.push(dist_x)
      distributionY.push(dist_y)
      deltaIds.push(binId - activeId)
    }
  }

  return {
    deltaIds,
    distributionX,
    distributionY
  }
}

/**
 * Returns Curve distribution params for custom bin range
 *
 * @param {number} activeId
 * @param {number[]} binRange
 * @param {CurrencyAmount[]} parsedAmounts
 * @param {number} alpha
 * @returns
 */
export const getCurveDistributionFromBinRange = (
  activeId: number,
  binRange: number[],
  parsedAmounts: CurrencyAmount[],
  alpha: number = 1 / 10
): LiquidityDistributionParams => {
  if (alpha > 1) {
    throw new Error('Alpha must be between 0 and 1')
  }

  const [parsedAmountA, parsedAmountB] = parsedAmounts

  const ONE = BigInt(10) ** BigInt(18)

  const deltaIds: number[] = []
  const distributionX: bigint[] = []
  const distributionY: bigint[] = []

  Big.RM = Big.roundDown
  const getGaussianDistribution = (x: number, sigma: number): bigint => {
    if (sigma === 0) return BigInt(10 ** 18)

    const val = new Big(Math.exp(-((x / sigma) ** 2) / 2))
      .times(10 ** 18)
      .round()
    const int = BigInt(val.toString())
    return int
  }

  const getSigma = (radius: number, alpha: number): number => {
    const denominator = Math.sqrt(-2 * Math.log(alpha))
    if (denominator === 0) return 0

    return radius / denominator
  }

  const radius_x = Math.abs(binRange[1] - activeId)
  const radius_y = Math.abs(binRange[0] - activeId)

  const sigma_x = getSigma(radius_x, alpha)
  const sigma_y = getSigma(radius_y, alpha)

  let nb_x = BigInt(0)
  let nb_y = BigInt(0)

  for (let binId = binRange[0]; binId <= binRange[1]; binId++) {
    const deltaId = binId - activeId
    let dist_x = BigInt(0)
    let dist_y = BigInt(0)

    if (deltaId >= 0 && parsedAmountA.greaterThan('0')) {
      dist_x = BigInt(2) * getGaussianDistribution(deltaId, sigma_x)
    }

    if (deltaId <= 0 && parsedAmountB.greaterThan('0')) {
      dist_y = BigInt(2) * getGaussianDistribution(deltaId, sigma_y)
    }

    if (
      deltaId === 0 &&
      parsedAmountA.greaterThan('0') &&
      parsedAmountB.greaterThan('0')
    ) {
      dist_x /= BigInt(2)
      dist_y /= BigInt(2)
    }

    nb_x += dist_x
    nb_y += dist_y

    if (dist_x > 0 || dist_y > 0) {
      distributionX.push(dist_x)
      distributionY.push(dist_y)
      deltaIds.push(deltaId)
    }
  }

  for (let i = 0; i < distributionX.length; i++) {
    if (nb_x > 0) {
      distributionX[i] = (BigInt(distributionX[i]) * ONE) / BigInt(nb_x)
    } else {
      distributionX[i] = BigInt(0)
    }
    if (nb_y > 0) {
      distributionY[i] = (BigInt(distributionY[i]) * ONE) / BigInt(nb_y)
    } else {
      distributionY[i] = BigInt(0)
    }
  }

  return {
    deltaIds,
    distributionX,
    distributionY
  }
}
