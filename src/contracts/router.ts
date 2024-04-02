import { Args, MAX_GAS_CALL } from '@massalabs/massa-web3'
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
    const simulatedGas = await this.simulate(params)
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: simulatedGas
    })
  }

  async add(params: LiquidityParameters) {
    const simulatedGas = await this.simulate(params)
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: simulatedGas
    })
  }

  async remove(params: LiquidityParameters) {
    const simulatedGas = await this.simulate(params)
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: simulatedGas
    })
  }

  // ESTIME GAS

  private async simulate(params: SwapParameters | LiquidityParameters) {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: params.methodName,
        parameter: params.args,
        maxGas: MAX_GAS_CALL
      })
      .then((res) => BigInt(res.info.gas_cost))
  }

  // QUERIES

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
