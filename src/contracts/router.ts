import { Client } from '@massalabs/massa-web3'
import { SwapParameters } from '../types'

export class IRouter {
  constructor(public address: string, public client: Client) {}

  async swapExactMASForTokens(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapExactTokensForMAS(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapExactTokensForTokens(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapMASForExactTokens(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapTokensForExactMAS(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapTokensForExactTokens(params: SwapParameters): Promise<string> {
    return this.swap(params)
  }

  async swapExactMASForTokensSupportingFeeOnTransferTokens(
    params: SwapParameters
  ): Promise<string> {
    return this.swap(params)
  }

  async swapExactTokensForMASSupportingFeeOnTransferTokens(
    params: SwapParameters
  ): Promise<string> {
    return this.swap(params)
  }

  async swapExactTokensForTokensSupportingFeeOnTransferTokens(
    params: SwapParameters
  ): Promise<string> {
    return this.swap(params)
  }

  private async swap(params: SwapParameters): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: BigInt(params.value),
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: 100_000_000n
    })
  }
}
