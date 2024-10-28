import { Args, bytesToStr, byteToBool, U256 } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class IPumpPair extends IBaseContract {
  async buy(
    amountIn: bigint,
    amountOutMin: bigint,
    to: string,
    deadline: bigint
  ) {
    return this.call({
      targetFunction: 'buy',
      coins: amountIn,
      parameter: new Args()
        .addU256(amountOutMin)
        .addString(to)
        .addU64(deadline)
        .serialize()
    })
  }

  async sell(
    amountIn: bigint,
    amountOutMin: bigint,
    to: string,
    deadline: bigint
  ) {
    return this.call({
      targetFunction: 'sell',
      parameter: new Args()
        .addU256(amountIn)
        .addU256(amountOutMin)
        .addString(to)
        .addU64(deadline)
        .serialize()
    })
  }

  async getTokens(): Promise<[string, string]> {
    return this.extract(['token0', 'token1']).then((r) => {
      if (!r[0]?.length || !r[1]?.length) throw new Error()
      return [bytesToStr(r[0]), bytesToStr(r[1])]
    })
  }

  async isLocked(): Promise<boolean> {
    return this.extract(['LOCKED']).then((r) => {
      if (!r[0]?.length) throw new Error()
      return byteToBool(r[0])
    })
  }

  async getReserves(): Promise<[bigint, bigint]> {
    return this.extract(['reserve0', 'reserve1']).then((r) => {
      if (!r[0]?.length || !r[1]?.length) throw new Error()
      return [U256.fromBytes(r[0]), U256.fromBytes(r[1])]
    })
  }
}
