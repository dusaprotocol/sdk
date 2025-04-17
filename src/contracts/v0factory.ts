import { Args, bytesToStr } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class IFactoryV0 extends IBaseContract {
  async createPair(
    tokenAAddress: string,
    tokenBAddress: string,
    amount: bigint
  ) {
    return this.call({
      targetFunction: 'createPair',
      parameter: new Args()
        .addString(tokenAAddress)
        .addString(tokenBAddress)
        .addU256(amount)
        .serialize()
    })
  }

  async getPair(tokenA: string, tokenB: string): Promise<string> {
    const token0 = tokenA < tokenB ? tokenA : tokenB
    const token1 = tokenA > tokenB ? tokenA : tokenB
    const key = 'pairMapping' + token0 + ':' + token1
    return this.extract([key]).then((res) => {
      if (!res[0]?.length) throw new Error('Pair not found')
      return bytesToStr(res[0])
    })
  }
}
