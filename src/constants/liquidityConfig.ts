import { parseEther } from '../lib/ethers'

/**
 * Configurations for Adding Liquidity Presets
 */

// 1) Spot (Uniform)
export const spotUniform = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [
    0, 0, 0, 0, 0, 0.090909, 0.181818, 0.181818, 0.181818, 0.181818, 0.181818
  ].map((el) => parseEther(el.toString())),
  distributionY: [
    0.181818, 0.181818, 0.181818, 0.181818, 0.181818, 0.090909, 0, 0, 0, 0, 0
  ].map((el) => parseEther(el.toString()))
}

// 2) Curve
export const curve = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [0, 0, 0, 0, 0, 0.18, 0.3, 0.24, 0.16, 0.08, 0.04].map((el) =>
    parseEther(el.toString())
  ),
  distributionY: [0.04, 0.08, 0.16, 0.24, 0.3, 0.18, 0, 0, 0, 0, 0].map((el) =>
    parseEther(el.toString())
  )
}

// 3) Bid-Ask
export const bidAsk = {
  deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
  distributionX: [0, 0, 0, 0, 0, 0.04, 0.12, 0.16, 0.2, 0.24, 0.24].map((el) =>
    parseEther(el.toString())
  ),
  distributionY: [0.24, 0.24, 0.2, 0.16, 0.12, 0.04, 0, 0, 0, 0, 0].map((el) =>
    parseEther(el.toString())
  )
}

// 4) Wide
export const wide = {
  deltaIds: [
    -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11,
    -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25
  ],
  distributionX: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0.0196, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392,
    0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392,
    0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392
  ].map((el) => parseEther(el.toString())),
  distributionY: [
    0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392,
    0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392,
    0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0392, 0.0196, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ].map((el) => parseEther(el.toString()))
}

export const LiquidityConfig = {
  spotUniform,
  curve,
  bidAsk,
  wide
}
