import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3'
import { Token } from '../v1entities'

export class LimitOrder implements Serializable<LimitOrder> {
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
      .addU32(BigInt(this.binId))
      .addU256(this.amountIn)
      .addU256(this.amountOutMin)
      .addString(this.to)
      .addU64(this.deadline)
      .addU32(BigInt(this.id))
    return args.serialize()
  }

  deserialize(data: Uint8Array, offset = 0): DeserializedResult<LimitOrder> {
    const args = new Args(data, offset)

    this.pair = args.nextString()
    this.swapForY = args.nextBool()
    this.binId = Number(args.nextU32())
    this.amountIn = args.nextU256()
    this.amountOutMin = args.nextU256()
    this.to = args.nextString()
    this.deadline = args.nextU64()
    this.id = Number(args.nextU32())

    return { instance: this, offset: args.getOffset() }
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
  threshold: number
}

export interface StartDCAParameters {
  amountEachDCA: bigint
  interval: number
  nbOfDCA: number
  tokenPath: string[]
  threshold: number
  startIn: number
}

// export interface Transaction {
//   to: string
//   method: string
//   value: bigint
//   data: Uint8Array
//   timestamp: bigint
//   executed: boolean
// }

export class Transaction implements Serializable<Transaction> {
  constructor(
    public to: string = '',
    public method: string = '',
    public value: bigint = 0n,
    public data: Uint8Array = new Uint8Array(0),
    public timestamp: bigint = 0n,
    public executed: boolean = false
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addString(this.to)
      .addString(this.method)
      .addU64(this.value)
      .addUint8Array(this.data)
      .addU64(this.timestamp)
      .addBool(this.executed)
    return args.serialize()
  }

  deserialize(data: Uint8Array, offset = 0): DeserializedResult<Transaction> {
    const args = new Args(data, offset)

    this.to = args.nextString()
    this.method = args.nextString()
    this.value = args.nextU64()
    this.data = args.nextUint8Array()
    this.timestamp = args.nextU64()
    this.executed = args.nextBool()

    return { instance: this, offset: args.getOffset() }
  }
}
