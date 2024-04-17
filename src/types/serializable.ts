import { Args, IDeserializedResult, ISerializable } from '@massalabs/massa-web3'

export class Address implements ISerializable<Address> {
  constructor(public str: string = '') {}

  serialize(): Uint8Array {
    const args = new Args().addString(this.str)
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<Address> {
    const args = new Args(data, offset)

    this.str = args.nextString()

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
}
