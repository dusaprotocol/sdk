import { Args, U256 } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'
import { IBaseContract } from './base'

interface GetAmountParams {
  reserveIn: bigint
  reserveOut: bigint
}
type GetAmountInParams = GetAmountParams & { amountOut: bigint }
type GetAmountOutParams = GetAmountParams & { amountIn: bigint }

export class IRouterV0 extends IBaseContract {
  // EXECUTE

  async swap(params: SwapParameters) {
    return this.execute(params)
  }

  async add(params: LiquidityParameters) {
    return this.execute(params)
  }

  async remove(params: LiquidityParameters) {
    return this.execute(params)
  }

  private async execute(params: SwapParameters | LiquidityParameters) {
    return this.call({
      targetFunction: params.methodName,
      coins: params.value,
      parameter: params.args.serialize()
    })
  }

  // QUERY

  async getAmountIn(params: GetAmountInParams): Promise<bigint> {
    return this.read({
      targetFunction: 'getSwapIn',
      parameter: new Args()
        .addU256(params.amountOut)
        .addU256(params.reserveIn)
        .addU256(params.reserveOut)
        .serialize()
    }).then((result) => U256.fromBytes(result.value))
  }

  async getAmountOut(params: GetAmountOutParams): Promise<bigint> {
    return this.read({
      targetFunction: 'getSwapOut',
      parameter: new Args()
        .addU256(params.amountIn)
        .addU256(params.reserveIn)
        .addU256(params.reserveOut)
        .serialize()
    }).then((result) => U256.fromBytes(result.value))
  }

  async quote(
    amountIn: bigint,
    tokenInAddress: string,
    tokenOutAddress: string
  ): Promise<bigint> {
    const args = new Args()
      .addU256(amountIn)
      .addString(tokenInAddress)
      .addString(tokenOutAddress)
    return this.read({
      targetFunction: 'quote',
      parameter: args.serialize()
    }).then((result) => U256.fromBytes(result.value))
  }
}
