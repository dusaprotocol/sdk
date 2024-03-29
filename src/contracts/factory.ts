import {
  Args,
  Client,
  bytesToSerializableObjectArray
} from '@massalabs/massa-web3'
import { bytesToArray, ArrayTypes } from '@massalabs/web3-utils'
import { LBPair, LBPairInformation } from '../types'

const maxGas = 100_000_000n

export class IFactory {
  constructor(public address: string, private client: Client) {}

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
        maxGas
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
        maxGas
      })
      .then((res) => {
        return new LBPairInformation().deserialize(res.returnValue, 0).instance
      })
  }

  async getAvailableLBPairBinSteps(
    token0Address: string,
    token1Address: string
  ): Promise<number[]> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getAvailableLBPairBinSteps',
        parameter: new Args()
          .addString(token0Address)
          .addString(token1Address)
          .serialize(),
        maxGas
      })
      .then((res) => {
        return bytesToArray<number>(res.returnValue, ArrayTypes.U32)
      })
  }
}
