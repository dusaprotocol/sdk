import { Args, bytesToSerializableObjectArray } from '@massalabs/massa-web3'
import { ArrayTypes, bytesToArray } from '@massalabs/web3-utils'
import { LBPair, LBPairInformation } from '../types'
import { IBaseContract } from './base'

export class IFactory extends IBaseContract {
  async getAllLBPairs(
    token0Address: string,
    token1Address: string
  ): Promise<LBPair[]> {
    return this.read({
      targetFunction: 'getAllLBPairs',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .serialize()
    }).then((res) =>
      bytesToSerializableObjectArray(res.value, LBPairInformation)
    )
  }

  async getLBPairInformation(
    token0Address: string,
    token1Address: string,
    binStep: number
  ): Promise<LBPair> {
    return this.read({
      targetFunction: 'getLBPairInformation',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .addU32(BigInt(binStep))
        .serialize()
    }).then((res) => new LBPairInformation().deserialize(res.value).instance)
  }

  async getAvailableLBPairBinSteps(
    token0Address: string,
    token1Address: string
  ): Promise<number[]> {
    return this.read({
      targetFunction: 'getAvailableLBPairBinSteps',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .serialize()
    }).then((res) => bytesToArray<number>(res.value, ArrayTypes.U32))
  }
}
