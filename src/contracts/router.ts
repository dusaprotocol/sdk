import { Args } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'
import { IBaseContract } from './base'
import { validateAddress } from '../utils'

interface GetSwapParams {
  pairAddress: string
  swapForY: boolean
}
type GetSwapInParams = GetSwapParams & { amountOut: bigint }
type GetSwapOutParams = GetSwapParams & { amountIn: bigint }

export class IRouter extends IBaseContract {
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

  async createPair(
    tokenA: string,
    tokenB: string,
    activeId: number,
    binStep: number,
    masToSend: bigint
  ) {
    if (!validateAddress(tokenA)) {
      throw new Error(`Invalid tokenA address: ${tokenA}`)
    }
    if (!validateAddress(tokenB)) {
      throw new Error(`Invalid tokenB address: ${tokenB}`)
    }
    return this.call({
      targetFunction: 'createLBPair',
      coins: masToSend,
      parameter: new Args()
        .addString(tokenA)
        .addString(tokenB)
        .addU32(BigInt(activeId))
        .addU32(BigInt(binStep))
        .serialize()
    })
  }

  private async execute(params: SwapParameters | LiquidityParameters) {
    return this.call({
      targetFunction: params.methodName,
      coins: params.value,
      parameter: params.args.serialize()
    })
  }

  // QUERY

  async getSwapIn(
    params: GetSwapInParams
  ): Promise<{ amountIn: bigint; feesIn: bigint }> {
    if (!validateAddress(params.pairAddress)) {
      throw new Error(`Invalid pair address: ${params.pairAddress}`)
    }
    return this.read({
      targetFunction: 'getSwapIn',
      parameter: new Args()
        .addString(params.pairAddress)
        .addU256(params.amountOut)
        .addBool(params.swapForY)
        .serialize()
    }).then((result) => {
      const args = new Args(result.value)
      return { amountIn: args.nextU256(), feesIn: args.nextU256() }
    })
  }

  async getSwapOut(
    params: GetSwapOutParams
  ): Promise<{ amountOut: bigint; feesIn: bigint }> {
    if (!validateAddress(params.pairAddress)) {
      throw new Error(`Invalid pair address: ${params.pairAddress}`)
    }
    return this.read({
      targetFunction: 'getSwapOut',
      parameter: new Args()
        .addString(params.pairAddress)
        .addU256(params.amountIn)
        .addBool(params.swapForY)
        .serialize()
    }).then((result) => {
      const args = new Args(result.value)
      return { amountOut: args.nextU256(), feesIn: args.nextU256() }
    })
  }
}
