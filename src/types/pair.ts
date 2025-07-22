import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3'

export type LBPair = DeserializedResult<LBPairInformation>['instance']

export class LBPairInformation implements Serializable<LBPairInformation> {
  constructor(
    public binStep: number = 0,
    public LBPair: string = '',
    public createdByOwner: boolean = false,
    public isBlacklisted: boolean = false
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addU32(BigInt(this.binStep))
      .addString(this.LBPair)
      .addBool(this.createdByOwner)
      .addBool(this.isBlacklisted)
    return args.serialize()
  }

  deserialize(
    data: Uint8Array,
    offset = 0
  ): DeserializedResult<LBPairInformation> {
    const args = new Args(data, offset)

    this.binStep = Number(args.nextU32())
    this.LBPair = args.nextString()
    this.createdByOwner = args.nextBool()
    this.isBlacklisted = args.nextBool()

    return { instance: this, offset: args.getOffset() }
  }
}

export interface LBPairReservesAndId {
  reserveX: bigint
  reserveY: bigint
  feesX: {
    total: bigint
    protocol: bigint
  }
  feesY: {
    total: bigint
    protocol: bigint
  }
  activeId: number
}

export interface FeeParameters {
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
  time: bigint
}

export interface BinReserves {
  reserveX: bigint
  reserveY: bigint
}

export enum LiquidityDistribution {
  SPOT,
  CURVE,
  BID_ASK,
  WIDE
}

export interface LiquidityDistributionParams {
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
}

export type BaseLiquidityParameters = {
  token0: string
  token1: string
  binStep: number
  amount0Min: bigint
  amount1Min: bigint
  to: string
  deadline: number
}

export type AddLiquidityParameters = BaseLiquidityParameters & {
  amount0: bigint
  amount1: bigint
  activeIdDesired: number
  idSlippage: number
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
}

export type RemoveLiquidityParameters = BaseLiquidityParameters & {
  ids: number[]
  amounts: bigint[]
}

export const LIQUIDITY_ROUTER_METHODS = [
  'addLiquidity',
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
