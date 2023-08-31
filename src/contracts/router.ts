import { Args, ArrayTypes, Client } from '@massalabs/massa-web3'
import { AddLiquidityParameters, SwapParameters } from '../types'

export class IRouter {
  constructor(public address: string, private client: Client) {}

  async swap(params: SwapParameters): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: params.methodName,
      coins: BigInt(params.value),
      parameter: params.args,
      fee: 100_000_000n,
      maxGas: 100_000_000n
    })
  }

  // ADD LIQUIDITY

  async addLiquidity(params: AddLiquidityParameters) {
    return this.add(params, 0n, 'addLiquidity')
  }

  async addLiquidityMAS(params: AddLiquidityParameters, amount: bigint) {
    return this.add(params, amount, 'addLiquidityMAS')
  }

  private async add(
    params: AddLiquidityParameters,
    amount: bigint,
    method: 'addLiquidity' | 'addLiquidityMAS'
  ) {
    const {
      token0,
      token1,
      binStep,
      amount0,
      amount1,
      amount0Min,
      amount1Min,
      activeIdDesired,
      idSlippage,
      deltaIds,
      distributionX,
      distributionY,
      to,
      deadline
    } = params

    const args = new Args()
      .addString(token0)
      .addString(token1)
      .addU64(BigInt(binStep))
      .addU64(amount0)
      .addU64(amount1)
      .addU64(amount0Min)
      .addU64(amount1Min)
      .addU64(BigInt(activeIdDesired))
      .addU64(BigInt(idSlippage))
      .addArray(deltaIds.map(BigInt), ArrayTypes.I64)
      .addArray(distributionX, ArrayTypes.U64)
      .addArray(distributionY, ArrayTypes.U64)
      .addString(to)
      .addU64(BigInt(deadline))

    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: method,
      parameter: args.serialize(),
      maxGas: BigInt(4_100_000_000),
      fee: 0n,
      coins: amount
    })
  }
}
