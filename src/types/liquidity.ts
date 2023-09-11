import { Args } from '@massalabs/massa-web3'

export interface AddLiquidityParameters {
  token0: string
  token1: string
  binStep: number
  amount0: bigint
  amount1: bigint
  amount0Min: bigint
  amount1Min: bigint
  activeIdDesired: number
  idSlippage: number
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
  to: string
  deadline: number
}

export interface RemoveLiquidityParameters {
  token0: string
  token1: string
  binStep: number
  amount0Min: bigint
  amount1Min: bigint
  ids: number[]
  amounts: bigint[]
  to: string
  deadline: number
}

export const LIQUIDITY_ROUTER_METHODS = [
  'addLiquidty',
  'addLiquidityMAS',
  'removeLiquidity',
  'removeLiquidityMAS'
] as const
export type LiquidityRouterMethod = (typeof LIQUIDITY_ROUTER_METHODS)[number]

/** The parameters to use in the call to the DEX Router to add/remove liquidity. */
export interface LiquidityParameters {
  // The method to call on LBRouter
  methodName: LiquidityRouterMethod
  // The arguments to pass to the method, all hex encoded.
  args: Args
  // The amount of nano to send.
  value: bigint
}
