import {
  Args,
  IContractReadOperationResponse,
  IDeserializedResult,
  ISerializable
} from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class Tx implements ISerializable<Tx> {
  constructor(
    public method: string = '',
    public args: Uint8Array,
    public to: string = ''
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
      .addString(this.method)
      .addUint8Array(this.args)
      .addString(this.to)
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset: number): IDeserializedResult<Tx> {
    const args = new Args(data, offset)

    this.method = args.nextString()
    this.args = args.nextUint8Array()
    this.to = args.nextString()

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
}

export class IMulticall extends IBaseContract {
  async aggregateMulticall(
    data: Tx[]
  ): Promise<IContractReadOperationResponse> {
    return this.read({
      targetFunction: 'multicall',
      parameter: new Args().addSerializableObjectArray(data).serialize()
    })
  }
}
