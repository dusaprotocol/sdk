import { ArrayTypes, bytesToArray, bytesToStr } from '@massalabs/web3-utils'
import { IBaseContract } from './base'

export class IPumpFactory extends IBaseContract {
  async getAllPair(): Promise<string[]> {
    return this.extract([`allPairs`]).then((r) => {
      if (!r[0] || !r[0].length) throw new Error()
      return bytesToArray(r[0], ArrayTypes.STRING)
    })
  }

  async getPair(token0Address: string, token1Address: string): Promise<string> {
    const keys = [`${token0Address}:${token1Address}`]
    return this.extract(keys).then((r) => {
      if (!r[0] || !r[0].length) throw new Error()
      return bytesToStr(r[0])
    })
  }
}
