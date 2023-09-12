import { Args, Client, strToBytes } from '@massalabs/massa-web3'
import { LBPairReservesAndId } from '../types'

export class ILBPair {
  constructor(public address: string, private client: Client) {}

  async getReservesAndId(): Promise<LBPairReservesAndId> {
    return await this.client
      .publicApi()
      .getDatastoreEntries([
        { address: this.address, key: strToBytes('PAIR_INFORMATION') }
      ])
      .then((res) => {
        const data = res[0].final_value
        if (!data) throw new Error('No pair information found')

        const args = new Args(data)
        const activeId = args.nextU32()
        const reserveX = args.nextU64()
        const reserveY = args.nextU64()
        const feesX = {
          total: args.nextU64(),
          protocol: args.nextU64()
        }
        const feesY = {
          total: args.nextU64(),
          protocol: args.nextU64()
        }
        return { activeId, reserveX, reserveY, feesX, feesY }
      })
  }
}
