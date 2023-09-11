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

export const ADD_ROUTER_METHODS = ['addLiquidty', 'addLiquidityMAS'] as const
export type AddRouterMethod = (typeof ADD_ROUTER_METHODS)[number]

export const REMOVE_ROUTER_METHODS = ['addLiquidty', 'addLiquidityMAS'] as const
export type RemoveRouterMethod = (typeof REMOVE_ROUTER_METHODS)[number]

/** The parameters to use in the call to the DEX Router to add/remove liquidity. */
export interface AddParameters {
  // The method to call on LBRouter
  methodName: AddRouterMethod
  // The arguments to pass to the method, all hex encoded.
  args: Args
  // The amount of nano to send.
  value: bigint
}

export interface RemoveParameters {
  // The method to call on LBRouter
  methodName: RemoveRouterMethod
  // The arguments to pass to the method, all hex encoded.
  args: Args
  // The amount of nano to send.
  value: bigint
}
