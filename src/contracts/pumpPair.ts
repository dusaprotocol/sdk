import { Args, bytesToStr } from '@massalabs/massa-web3'
import { bytesToU256 } from '@massalabs/web3-utils'
import { IBaseContract } from './base'

export class IPumpPair extends IBaseContract {
  async buy(
    amountIn: bigint,
    amountOutMin: bigint,
    to: string,
    deadline: bigint
  ): Promise<string> {
    return this.call({
      targetFunction: 'buy',
      coins: amountIn,
      parameter: new Args().addU256(amountOutMin).addString(to).addU64(deadline)
    })
  }

  async sell(
    amountIn: bigint,
    amountOutMin: bigint,
    to: string,
    deadline: bigint
  ): Promise<string> {
    return this.call({
      targetFunction: 'sell',
      parameter: new Args()
        .addU256(amountIn)
        .addU256(amountOutMin)
        .addString(to)
        .addU64(deadline)
    })
  }

  async getTokens(): Promise<[string, string]> {
    return this.extract(['token0', 'token1']).then((r) => {
      if (!r[0] || !r[1] || !r[0].length || !r[1].length) throw new Error()
      return [bytesToStr(r[0]), bytesToStr(r[1])]
    })
  }

  async isLocked(): Promise<string> {
    return this.extract(['LOCKED']).then((r) => {
      if (!r[0] || !r[0].length) throw new Error()
      return bytesToStr(r[0])
    })
  }

  async getReserves(): Promise<[bigint, bigint]> {
    return this.extract(['reserve0', 'reserve1']).then((r) => {
      if (!r[0] || !r[1] || !r[0].length || !r[1].length) throw new Error()
      return [bytesToU256(r[0]), bytesToU256(r[1])]
    })
  }
}
