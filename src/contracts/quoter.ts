import { Args, ArrayTypes, MAX_GAS_CALL } from '@massalabs/massa-web3'
import { Address, Quote } from '../types'
import { IBaseContract } from './base'

export class IQuoter extends IBaseContract {
  async findBestPathFromAmountIn(
    route: string[],
    amountIn: string
  ): Promise<Quote> {
    return this.read({
      targetFunction: 'findBestPathFromAmountIn',
      parameter: new Args()
        .addSerializableObjectArray(route.map((r) => new Address(r)))
        .addU256(BigInt(amountIn))
        .serialize(),
      maxGas: MAX_GAS_CALL
    }).then((result) => {
      const args = new Args(result.returnValue)
      const route = args.nextSerializableObjectArray(Address).map((r) => r.str)
      const pairs = args.nextSerializableObjectArray(Address).map((r) => r.str)
      const binSteps: bigint[] = args.nextArray(ArrayTypes.U64)
      const amounts: bigint[] = args.nextArray(ArrayTypes.U256)
      const virtualAmountsWithoutSlippage: bigint[] = args.nextArray(
        ArrayTypes.U256
      )
      const fees: bigint[] = args.nextArray(ArrayTypes.U256)
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
    return this.read({
      targetFunction: 'findBestPathFromAmountOut',
      parameter: new Args()
        .addSerializableObjectArray(route.map((r) => new Address(r)))
        .addU256(BigInt(amountOut))
        .serialize(),
      maxGas: MAX_GAS_CALL
    }).then((result) => {
      const args = new Args(result.returnValue)
      const route = args.nextSerializableObjectArray(Address).map((r) => r.str)
      const pairs = args.nextSerializableObjectArray(Address).map((r) => r.str)
      const binSteps: bigint[] = args.nextArray(ArrayTypes.U64)
      const amounts: bigint[] = args.nextArray(ArrayTypes.U256)
      const virtualAmountsWithoutSlippage: bigint[] = args.nextArray(
        ArrayTypes.U256
      )
      const fees: bigint[] = args.nextArray(ArrayTypes.U256)
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
