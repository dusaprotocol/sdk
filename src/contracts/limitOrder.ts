import { Args, ArrayTypes, bytesToStr } from '@massalabs/massa-web3'
import { IBaseContract } from './base'
import { LimitOrder } from 'types/periphery'

export class ILimitOrder extends IBaseContract {
  async addLimitOrder(
    orderType: number,
    binId: number,
    amount: bigint,
    masToSend = 0n
  ) {
    return this.call({
      targetFunction: 'addLimitOrder',
      parameter: new Args()
        .addU8(BigInt(orderType))
        .addU64(BigInt(binId))
        .addU256(amount)
        .serialize(),
      coins: masToSend
    })
  }

  async editLimitOrder(orderId: number, amount: bigint, masToSend = 0n) {
    return this.call({
      targetFunction: 'editLimitOrder',
      parameter: new Args().addU32(BigInt(orderId)).addU256(amount).serialize(),
      coins: masToSend
    })
  }

  async cancelOrder(orderId: number) {
    return this.call({
      targetFunction: 'cancelOrder',
      parameter: new Args().addU32(BigInt(orderId)).serialize()
    })
  }

  async claimOrder(orderId: number) {
    return this.call({
      targetFunction: 'claimOrder',
      parameter: new Args().addU32(BigInt(orderId)).serialize()
    })
  }

  async getPair(): Promise<string> {
    const res = await this.extract(['PAIR'])
    if (!res[0] || !res[0].length) throw new Error('Pair not found in storage')
    return bytesToStr(res[0])
  }

  async getLimitOrder(id: number): Promise<LimitOrder> {
    const res = await this.extract([`Orders::${id}`])
    if (!res[0] || !res[0].length)
      throw new Error(`Order with id ${id} not found`)
    const args = new Args(res[0])
    return {
      orderId: id,
      orderType: Number(args.nextU8()),
      binId: Number(args.nextU64()),
      amountIn: args.nextU256(),
      owner: args.nextString(),
      amountLPToken: args.nextU256(),
      executed: args.nextBool()
    }
  }

  async getUserOrderIds(user: string): Promise<number[]> {
    const res = await this.extract([`User::${user}`])
    if (!res[0] || !res[0].length) return []
    const args = new Args(res[0])
    return args.nextArray(ArrayTypes.U32)
  }

  async getBinOrderIds(binId: bigint): Promise<number[]> {
    const res = await this.extract([`Bin::${binId.toString()}`])
    if (!res[0] || !res[0].length) return []
    const args = new Args(res[0])
    return args.nextArray(ArrayTypes.U32)
  }
}
