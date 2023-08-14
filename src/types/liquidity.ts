/** The parameters to use in the call to the DEX V2 Router to add liquidity. */
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
