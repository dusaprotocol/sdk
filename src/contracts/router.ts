import { Args, Client } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'

const U32_MAX = 2n ** 32n - 1n

interface GetSwap {
  pairAddress: string
  amountIn: bigint
  swapForY: boolean
}

export class IRouter {
  constructor(public address: string, private client: Client) {}

  async swap(params: SwapParameters): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: 100_000_000n
    })
  }

  async addOrRemove(params: LiquidityParameters) {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: params.value,
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: U32_MAX
    })
  }

  async getSwapIn(
    params: GetSwap
  ): Promise<{ amountIn: bigint; feesIn: bigint }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getSwapIn',
        parameter: new Args()
          .addString(params.pairAddress)
          .addU64(params.amountIn)
          .addBool(params.swapForY),
        maxGas: U32_MAX
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        return {
          amountIn: args.nextU64(),
          feesIn: args.nextU64()
        }
      })
  }

  async getSwapOut(
    params: GetSwap
  ): Promise<{ amountOut: bigint; feesIn: bigint }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getSwapOut',
        parameter: new Args()
          .addString(params.pairAddress)
          .addU64(params.amountIn)
          .addBool(params.swapForY),
        maxGas: U32_MAX
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        return {
          amountOut: args.nextU64(),
          feesIn: args.nextU64()
        }
      })
  }
}
