import { Client } from '@massalabs/massa-web3'
import { LiquidityParameters, SwapParameters } from '../types'

const U32_MAX = BigInt(2 ** 32 - 1)

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
}
