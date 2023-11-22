import {
  Args,
  Client,
  IDeserializedResult,
  ISerializable,
  bytesToSerializableObjectArray
} from '@massalabs/massa-web3'

const maxGas = 100_000_000n

export class Tx implements ISerializable<Tx> {
  constructor(
    public targetAddress: string = '',
    public functionName: string = '',
    public parameter: Uint8Array
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
    args.addString(this.targetAddress)
    args.addString(this.functionName)
    args.addUint8Array(this.parameter)
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset: number): IDeserializedResult<Tx> {
    const args = new Args(data, offset)

    this.targetAddress = args.nextString()
    this.functionName = args.nextString()
    this.parameter = args.nextUint8Array()

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
}

export class IMulticall {
  constructor(private client: Client) {}

  async aggregateMulticall(data: Tx[]): Promise<Uint8Array> {
    let datastore = new Map<Uint8Array, Uint8Array>()

    const args = new Args()
    data.forEach((tx) => {
      args.addUint8Array(tx.serialize())
      datastore
    })

    return this.client
      .smartContracts()
      .executeReadOnlySmartContract({
        //     contractDataBinary: ,

        //   parameter: args
        // .serialize(),
        datastore,
        fee: 0n,
        maxCoins: 0n,
        maxGas
      })
      .then((res) => res.returnValue)
  }
}
