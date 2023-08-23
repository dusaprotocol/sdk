import { Args, IDeserializedResult, ISerializable } from '@massalabs/massa-web3'
import { Percent } from '../v1entities/fractions'

export interface LBPair {
  binStep: number
  LBPair: string
  createdByOwner: boolean
  isBlacklisted: boolean
}

export class LBPairInformation implements ISerializable<LBPairInformation> {
  constructor(
    public binStep: number = 0,
    public LBPair: string = '',
    public createdByOwner: boolean = false,
    public isBlacklisted: boolean = false
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
    args.addU32(this.binStep)
    args.addString(this.LBPair)
    args.addBool(this.createdByOwner)
    args.addBool(this.isBlacklisted)
    return Uint8Array.from(args.serialize())
  }

  deserialize(
    data: Uint8Array,
    offset: number
  ): IDeserializedResult<LBPairInformation> {
    const args = new Args(data, offset)

    this.binStep = args.nextU32()
    this.LBPair = args.nextString()
    this.createdByOwner = args.nextBool()
    this.isBlacklisted = args.nextBool()

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
}

export interface LBPairReservesAndId {
  reserveX: bigint
  reserveY: bigint
  activeId: number
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
  binStep: number
  amountX: bigint
  amountY: bigint
  amountXMin: bigint
  amountYMin: bigint
  activeIdDesired: number
  idSlippage: number
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
  to: string
  deadline: number
}

export interface BinReserves {
  reserveX: bigint
  reserveY: bigint
}

export enum LiquidityDistribution {
  SPOT,
  CURVE,
  BID_ASK
}

export interface LiquidityDistributionParams {
  deltaIds: number[]
  distributionX: bigint[]
  distributionY: bigint[]
}
