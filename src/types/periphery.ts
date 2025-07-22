import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3'

export class LimitOrder implements Serializable<LimitOrder> {
  /**
   * @param orderType {u8} - 0 = BID, 1 = ASK
   * @param binId {u64} - Id of the bin to use for the swap
   * @param amountIn {u256} - Amount of tokens to swap
   * @param owner {Address} - Address to receive the tokens
   * @param amountLPToken {u256} - Number of LBToken received in return
   * @param executed {bool} - If the order was executed
   */
  constructor(
    public orderType: bigint = 0n,
    public binId: bigint = 0n,
    public amountIn: bigint = 0n,
    public owner: string = '',
    public amountLPToken: bigint = 0n,
    public executed: boolean = false
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addU8(this.orderType)
      .addU64(this.binId)
      .addU256(this.amountIn)
      .addString(this.owner)
      .addU256(this.amountLPToken)
      .addBool(this.executed)
      .serialize()
  }

  deserialize(data: Uint8Array, offset = 0): DeserializedResult<LimitOrder> {
    const args = new Args(data, offset)
    this.orderType = args.nextU8()
    this.binId = args.nextU64()
    this.amountIn = args.nextU256()
    this.owner = args.nextString()
    this.amountLPToken = args.nextU256()
    this.executed = args.nextBool()

    return { instance: this, offset: args.getOffset() }
  }
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
