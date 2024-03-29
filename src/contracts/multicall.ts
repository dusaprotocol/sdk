import {
  Args,
  Client,
  IContractReadOperationResponse,
  IDeserializedResult,
  ISerializable,
  MAX_GAS_CALL
} from '@massalabs/massa-web3'

export class Tx implements ISerializable<Tx> {
  constructor(
    public method: string = '',
    public args: Uint8Array,
    public to: string = ''
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
    args.addString(this.method)
    args.addUint8Array(this.args)
    args.addString(this.to)
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

export class IMulticall {
  constructor(public address: string, private client: Client) {}

  async aggregateMulticall(
    data: Tx[]
  ): Promise<IContractReadOperationResponse> {
    // const datastore = new Map<Uint8Array, Uint8Array>()
    // datastore.set(new Uint8Array([0x00]), new Args().addSerializableObjectArray(data).serialize())

    return this.client.smartContracts().readSmartContract({
      targetAddress: this.address,
      targetFunction: 'multicall',
      parameter: new Args().addSerializableObjectArray(data).serialize(),
      maxGas: MAX_GAS_CALL
    })
  }
}
