import { Args, IDeserializedResult, ISerializable } from '@massalabs/massa-web3'
import { Token } from '../v1entities'
import { Address } from './serializable'

export class LimitOrder implements ISerializable<LimitOrder> {
  constructor(
    public pair: string = '',
    public swapForY: boolean = false,
    public binId: number = 0,
    public amountIn: bigint = 0n,
    public amountOutMin: bigint = 0n,
    public to: string = '',
    public deadline: bigint = 0n,
    public id: number = 0
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addString(this.pair)
      .addBool(this.swapForY)
      .addU32(this.binId)
      .addU256(this.amountIn)
      .addU256(this.amountOutMin)
      .addString(this.to)
      .addU64(this.deadline)
      .addU32(this.id)

    return Uint8Array.from(args.serialize())
  }

  deserialize(
    data: Uint8Array,
    offset: number
  ): IDeserializedResult<LimitOrder> {
    const args = new Args(data, offset)

    this.pair = args.nextString()
    this.swapForY = args.nextBool()
    this.binId = args.nextU32()
    this.amountIn = args.nextU256()
    this.amountOutMin = args.nextU256()
    this.to = args.nextString()
    this.deadline = args.nextU64()
    this.id = args.nextU32()

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
}

export interface DCA {
  id: number
  amountEachDCA: bigint
  interval: number
  nbOfDCA: number
  tokenPath: Token[]
  startTime: number
  endTime: number
}

export interface StartDCAParameters {
  amountEachDCA: bigint
  interval: number
  nbOfDCA: number
  tokenPath: Address[]
  startIn: number
}
