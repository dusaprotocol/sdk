import { Args, DeserializedResult, Serializable } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class Tx implements Serializable<Tx> {
  constructor(
    public method: string = '',
    public args: Uint8Array = new Uint8Array(),
    public to: string = '',
    public coins: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addString(this.method)
      .addUint8Array(this.args)
      .addString(this.to)
      .addU64(this.coins)
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset: number): DeserializedResult<Tx> {
    const args = new Args(data, offset)

    this.method = args.nextString()
    this.args = args.nextUint8Array()
    this.to = args.nextString()
    this.coins = args.nextU64()

    return { instance: this, offset: args.getOffset() }
  }
}

export class IMulticall extends IBaseContract {
  async aggregateMulticall(data: Tx[]) {
    return this.read({
      targetFunction: 'multicall',
      parameter: new Args().addSerializableObjectArray(data).serialize()
    })
  }

  async executeMulticall(data: Tx[], coins: bigint) {
    return this.call({
      targetFunction: 'multicall',
      parameter: new Args().addSerializableObjectArray(data).serialize(),
      coins
    })
  }
}
