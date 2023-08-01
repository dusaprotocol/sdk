import { Args, Client } from '@massalabs/massa-web3'
import { LBPair } from '../types'

export class IFactory {
  constructor(public address: string, public client: Client) {}

  async getAllLBPairs(
    token0Address: string,
    token1Address: string
  ): Promise<LBPair[]> {
    await this.client.smartContracts().readSmartContract({
      targetAddress: this.address,
      targetFunction: 'getAllLBPairs',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .serialize(),
      maxGas: BigInt(100_000_000)
    })
    const pairs: LBPair[] = []
    return pairs
  }

  async getLBPairInformation(
    token0Address: string,
    token1Address: string,
    binStep: number
  ): Promise<LBPair> {
    await this.client.smartContracts().readSmartContract({
      targetAddress: this.address,
      targetFunction: 'getLBPairInformation',
      parameter: new Args()
        .addString(token0Address)
        .addString(token1Address)
        .addU32(binStep)
        .serialize(),
      maxGas: BigInt(100_000_000)
    })
    return { binStep, createdByOwner: true, isBlacklisted: false, LBPair: '' }
  }
}
