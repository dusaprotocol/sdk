import { Args } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'
import { IBaseContract } from './base'

interface GetSwapParams {
  pairAddress: string
  swapForY: boolean
}
type GetSwapInParams = GetSwapParams & { amountOut: bigint }
type GetSwapOutParams = GetSwapParams & { amountIn: bigint }

export class IRouter extends IBaseContract {
  // EXECUTE

  async swap(params: SwapParameters): Promise<string> {
    return this.execute(params)
  }

  async add(params: LiquidityParameters): Promise<string> {
    return this.execute(params)
  }

  async remove(params: LiquidityParameters): Promise<string> {
    return this.execute(params)
  }

  private async execute(params: SwapParameters | LiquidityParameters) {
    return this.call({
      targetFunction: params.methodName,
      coins: params.value,
      parameter: params.args
    })
  }

  // QUERY

  async getSwapIn(
    params: GetSwapInParams
  ): Promise<{ amountIn: bigint; feesIn: bigint }> {
    return this.read({
      targetFunction: 'getSwapIn',
      parameter: new Args()
        .addString(params.pairAddress)
        .addU256(params.amountOut)
        .addBool(params.swapForY)
    }).then((result) => {
      const args = new Args(result.returnValue)
      return { amountIn: args.nextU256(), feesIn: args.nextU256() }
    })
  }

  async getSwapOut(
    params: GetSwapOutParams
  ): Promise<{ amountOut: bigint; feesIn: bigint }> {
    return this.read({
      targetFunction: 'getSwapOut',
      parameter: new Args()
        .addString(params.pairAddress)
        .addU256(params.amountIn)
        .addBool(params.swapForY)
    }).then((result) => {
      const args = new Args(result.returnValue)
      return { amountOut: args.nextU256(), feesIn: args.nextU256() }
    })
  }
}
