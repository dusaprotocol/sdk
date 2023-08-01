export * from './internal'
export * from './v2Addrs'
export * from './liquidityConfig'

import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)
