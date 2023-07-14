import { Args, ArrayType, Client } from '@massalabs/massa-web3'
import { Quote } from 'types'
import { Address } from 'types/serializable'

export class IQuoter {
  constructor(public address: string, public client: Client) {}

  async findBestPathFromAmountIn(
    route: string[],
    amountIn: string
  ): Promise<Quote> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'findBestPathFromAmountIn',
        parameter: new Args()
          .addSerializableObjectArray(route.map((r) => new Address(r)))
          .addU64(BigInt(amountIn))
          .serialize(),
        maxGas: BigInt(100_000_000)
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        const route = args
          .nextSerializableObjectArray(Address)
          .map((r) => r.str)
        const pairs = args
          .nextSerializableObjectArray(Address)
          .map((r) => r.str)
        const binSteps: bigint[] = args.nextArray(ArrayType.U64)
        const amounts: bigint[] = args.nextArray(ArrayType.U64)
        const virtualAmountsWithoutSlippage: bigint[] = args.nextArray(
          ArrayType.U64
        )
        const fees: bigint[] = args.nextArray(ArrayType.U64)
        return {
          route,
          pairs,
          binSteps,
          amounts,
          virtualAmountsWithoutSlippage,
          fees
        }
      })
  }

  async findBestPathFromAmountOut(
    route: string[],
    amountOut: string
  ): Promise<Quote> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'findBestPathFromAmountOut',
        parameter: new Args()
          .addSerializableObjectArray(route.map((r) => new Address(r)))
          .addU64(BigInt(amountOut))
          .serialize(),
        maxGas: BigInt(100_000_000)
      })
      .then((result) => {
        const args = new Args(result.returnValue)
        const route = args
          .nextSerializableObjectArray(Address)
          .map((r) => r.str)
        const pairs = args
          .nextSerializableObjectArray(Address)
          .map((r) => r.str)
        const binSteps: bigint[] = args.nextArray(ArrayType.U64)
        const amounts: bigint[] = args.nextArray(ArrayType.U64)
        const virtualAmountsWithoutSlippage: bigint[] = args.nextArray(
          ArrayType.U64
        )
        const fees: bigint[] = args.nextArray(ArrayType.U64)
        return {
          route,
          pairs,
          binSteps,
          amounts,
          virtualAmountsWithoutSlippage,
          fees
        }
      })
  }
}
