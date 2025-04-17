import { bytesToStr } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class ILimitOrder extends IBaseContract {
  async getTokens(): Promise<[string, string]> {
    return this.extract(['token0', 'token1']).then((r) => {
      if (!r[0]?.length || !r[1]?.length) throw new Error()
      return [bytesToStr(r[0]), bytesToStr(r[1])]
    })
  }
}
