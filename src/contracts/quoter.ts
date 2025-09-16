import { Args, ArrayTypes } from '@massalabs/massa-web3'
import { Quote } from '../types'
import { IBaseContract } from './base'
import { BigintIsh } from '../constants'

export class IQuoter extends IBaseContract {
  async findBestPathFromAmountIn(
    route: string[],
    amountIn: BigintIsh,
    checkLegacy: boolean = true
  ): Promise<Quote> {
    return this.findBestPath(route, amountIn, true, checkLegacy)
  }

  async findBestPathFromAmountOut(
    route: string[],
    amountOut: BigintIsh,
    checkLegacy: boolean = true
  ): Promise<Quote> {
    return this.findBestPath(route, amountOut, false, checkLegacy)
  }

  private async findBestPath(
    route: string[],
    amount: BigintIsh,
    isExactIn: boolean,
    checkLegacy: boolean
  ): Promise<Quote> {
    return this.read({
      targetFunction: isExactIn
        ? 'findBestPathFromAmountIn'
        : 'findBestPathFromAmountOut',
      parameter: new Args()
        .addArray(route, ArrayTypes.STRING)
        .addU256(BigInt(amount))
        .addBool(checkLegacy)
        .serialize()
    }).then((result) => {
      if (result.info.error || !result.value?.length)
        throw new Error(result.info.error || 'No result')

      return new Quote().deserialize(result.value).instance
    })
  }
}
