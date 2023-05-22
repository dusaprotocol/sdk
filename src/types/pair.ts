import { Percent } from 'v1entities/fractions'

export type BigNumberish = BigInt | string | number

export interface LBPair {
  binStep: BigNumberish
  LBPair: string
  createdByOwner: boolean
  isBlacklisted: boolean
}

export interface LBPairReservesAndId {
  reserveX: BigNumberish
  reserveY: BigNumberish
  activeId: BigNumberish
}

export interface LBPairFeeParameters {
  binStep: number
  baseFactor: number
  filterPeriod: number
  decayPeriod: number
  reductionFactor: number
  variableFeeControl: number
  protocolShare: number
  maxVolatilityAccumulated: number
  volatilityAccumulated: number
  volatilityReference: number
  indexRef: number
  time: number
}

export interface LBPairFeePercent {
  baseFeePct: Percent
  variableFeePct: Percent
}

export interface LiquidityParametersStruct {
  tokenX: string
  tokenY: string
  binStep: BigNumberish
  amountX: BigNumberish
  amountY: BigNumberish
  amountXMin: BigNumberish
  amountYMin: BigNumberish
  activeIdDesired: BigNumberish
  idSlippage: BigNumberish
  deltaIds: BigNumberish[]
  distributionX: BigNumberish[]
  distributionY: BigNumberish[]
  to: string
  deadline: BigNumberish
}

export interface BinReserves {
  reserveX: BigInt
  reserveY: BigInt
}

export enum LiquidityDistribution {
  SPOT,
  CURVE,
  BID_ASK
}

export interface LiquidityDistributionParams {
  deltaIds: number[]
  distributionX: BigInt[]
  distributionY: BigInt[]
}
