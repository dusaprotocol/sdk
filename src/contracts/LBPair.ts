import { Args, Client } from '@massalabs/massa-web3'
import { ArrayTypes } from '@massalabs/web3-utils'
import { LBPairReservesAndId } from '../types'

const maxGas = 100_000_000n

export class ILBPair {
  constructor(public address: string, private client: Client) {}

  async getReservesAndId(): Promise<LBPairReservesAndId> {
    return await this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getPairInformation',
        parameter: new Args(),
        maxGas
      })
      .then((res) => {
        const args = new Args(res.returnValue)
        const activeId = args.nextU32()
        const reserveX = args.nextU256()
        const reserveY = args.nextU256()
        const feesX = {
          total: args.nextU256(),
          protocol: args.nextU256()
        }
        const feesY = {
          total: args.nextU256(),
          protocol: args.nextU256()
        }
        return { activeId, reserveX, reserveY, feesX, feesY }
      })
  }

  async pendingFees(
    account: string,
    ids: number[]
  ): Promise<{
    amount0: bigint
    amount1: bigint
  }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'pendingFees',
        parameter: new Args()
          .addString(account)
          .addArray(ids.map(BigInt), ArrayTypes.U64)
          .serialize(),
        maxGas
      })
      .then((res) => {
        const args = new Args(res.returnValue)
        const amount0 = args.nextU256()
        const amount1 = args.nextU256()
        return { amount0, amount1 }
      })
  }
}
