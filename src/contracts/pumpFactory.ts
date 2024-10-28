import { ArrayTypes, bytesToArray, bytesToStr } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class IPumpFactory extends IBaseContract {
  async getAllPairs(): Promise<string[]> {
    return this.extract(['allPairs']).then((r) => {
      if (!r[0]?.length) throw new Error()
      return bytesToArray(r[0], ArrayTypes.STRING)
    })
  }

  async getPair(token0Address: string, token1Address: string): Promise<string> {
    const key = `pairMapping::${token0Address}:${token1Address}`
    return this.extract([key]).then((r) => {
      if (!r[0]?.length) throw new Error()
      return bytesToStr(r[0])
    })
  }
}
