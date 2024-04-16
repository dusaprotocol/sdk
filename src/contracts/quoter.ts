import { Args, MAX_GAS_CALL } from '@massalabs/massa-web3'
import { Address, Quote } from '../types'
import { IBaseContract } from './base'

export class IQuoter extends IBaseContract {
  async findBestPathFromAmountIn(
    route: string[],
    amountIn: string
  ): Promise<Quote> {
    return this.findBestPath(route, amountIn, true)
  }

  async findBestPathFromAmountOut(
    route: string[],
    amountOut: string
  ): Promise<Quote> {
    return this.findBestPath(route, amountOut, false)
  }

  private async findBestPath(
    route: string[],
    amount: string,
    isExactIn: boolean
  ): Promise<Quote> {
    return this.read({
      targetFunction: isExactIn
        ? 'findBestPathFromAmountIn'
        : 'findBestPathFromAmountOut',
      parameter: new Args()
        .addSerializableObjectArray(route.map((r) => new Address(r)))
        .addU256(BigInt(amount))
        .addBool(isExactIn)
        .serialize(),
      maxGas: MAX_GAS_CALL
    }).then((result) => new Quote().deserialize(result.returnValue).instance)
  }
}
