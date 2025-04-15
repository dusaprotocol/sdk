import { Args, IDeserializedResult, ISerializable } from '@massalabs/massa-web3'

export interface LimitOrder {
  orderId: number
  orderType: number
  binId: number
  amountIn: bigint
  owner: string
  amountLPToken: bigint
  executed: boolean
}

export interface DCA {
  id: number
  amountEachDCA: bigint
  interval: number
  nbOfDCA: number
  tokenPath: string[]
  threshold: number
  moreGas: boolean
  startTime: number
  endTime: number
  executedCount: number
  deferredCallId: string
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

export class Transaction implements ISerializable<Transaction> {
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
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<Transaction> {
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
