import { Args, MAX_GAS_CALL } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'
import { IBaseContract, fee } from './base'

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
    const simulatedGas = await this.estimateGas(params)
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee,
      maxGas: simulatedGas
    })
  }

  // SIMULATE

  async simulate(params: SwapParameters | LiquidityParameters) {
    return this.client.smartContracts().readSmartContract({
      targetAddress: this.address,
      targetFunction: params.methodName,
      parameter: params.args,
      maxGas: MAX_GAS_CALL
    })
  }

  private async estimateGas(params: SwapParameters | LiquidityParameters) {
    return this.simulate(params)
      .then((result) => BigInt(result.info.gas_cost))
      .catch(() => MAX_GAS_CALL)
  }

  // QUERY

  async getSwapIn(
    params: GetSwapInParams
  ): Promise<{ amountIn: bigint; feesIn: bigint }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getSwapIn',
        parameter: new Args()
          .addString(params.pairAddress)
          .addU256(params.amountOut)
          .addBool(params.swapForY),
        maxGas: MAX_GAS_CALL
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        return {
          amountIn: args.nextU256(),
          feesIn: args.nextU256()
        }
      })
  }

  async getSwapOut(
    params: GetSwapOutParams
  ): Promise<{ amountOut: bigint; feesIn: bigint }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getSwapOut',
        parameter: new Args()
          .addString(params.pairAddress)
          .addU256(params.amountIn)
          .addBool(params.swapForY),
        maxGas: MAX_GAS_CALL
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        return {
          amountOut: args.nextU256(),
          feesIn: args.nextU256()
        }
      })
  }
}
