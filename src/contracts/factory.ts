import {
  Args,
  ArrayTypes,
  bytesToArray,
  bytesToSerializableObjectArray
} from '@massalabs/massa-web3'
import { LBPair, LBPairInformation } from '../types'
import { IBaseContract } from './base'
import { validateAddress } from '../utils'

export class IFactory extends IBaseContract {
  async getAllLBPairs(
    token0Address: string,
    token1Address: string
  ): Promise<LBPair[]> {
    if (!validateAddress(token0Address))
      throw new Error(`Invalid token address: ${token0Address}`)
    if (!validateAddress(token1Address))
      throw new Error(`Invalid token address: ${token1Address}`)
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
    if (!validateAddress(token0Address))
      throw new Error(`Invalid token address: ${token0Address}`)
    if (!validateAddress(token1Address))
      throw new Error(`Invalid token address: ${token1Address}`)
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
    if (!validateAddress(token0Address))
      throw new Error(`Invalid token address: ${token0Address}`)
    if (!validateAddress(token1Address))
      throw new Error(`Invalid token address: ${token1Address}`)
    return this.read({
      targetFunction: 'getAvailableLBPairBinSteps',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .serialize()
    }).then((res) =>
      bytesToArray<bigint>(res.value, ArrayTypes.U32).map(Number)
    )
  }
}
