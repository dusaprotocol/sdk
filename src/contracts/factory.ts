import {
  Args,
  Client,
  bytesToSerializableObjectArray
} from '@massalabs/massa-web3'
import { LBPair, LBPairInformation } from '../types'

export class IFactory {
  constructor(public address: string, public client: Client) {}

  async getAllLBPairs(
    token0Address: string,
    token1Address: string
  ): Promise<LBPair[]> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getAllLBPairs',
        parameter: new Args()
          .addString(token0Address)
          .addString(token1Address)
          .serialize(),
        maxGas: BigInt(100_000_000)
      })
      .then((res) => {
        return bytesToSerializableObjectArray(
          res.returnValue,
          LBPairInformation
        )
      })
  }

  async getLBPairInformation(
    token0Address: string,
    token1Address: string,
    binStep: number
  ): Promise<LBPair> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getLBPairInformation',
        parameter: new Args()
          .addString(token0Address)
          .addString(token1Address)
          .addU32(binStep)
          .serialize(),
        maxGas: BigInt(100_000_000)
      })
      .then((res) => {
        console.log(res.returnValue)
        return new LBPairInformation().deserialize(res.returnValue, 0).instance
      })
  }
}
