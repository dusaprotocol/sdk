export * from './internal'
export * from './v2Addrs'
export * from './liquidityConfig'

// exports for external consumption
export type BigintIsh = bigint | string

export const MINIMUM_LIQUIDITY = BigInt(1000)
