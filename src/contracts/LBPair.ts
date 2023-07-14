import { Args, Client, strToBytes } from '@massalabs/massa-web3'
import { LBPairReservesAndId } from '../types'

export class ILBPair {
  constructor(public address: string, public client: Client) {}

  async getReservesAndId(): Promise<LBPairReservesAndId> {
    return await this.client
      .publicApi()
      .getDatastoreEntries([
        { address: this.address, key: strToBytes('PAIR_INFORMATION') }
      ])
      .then((res) => {
        const data = res[0].candidate_value
        if (!data) throw new Error('No pair information found')

        const args = new Args(data)
        const activeId = args.nextU32()
        const reserveX = Number(args.nextU64())
        const reserveY = Number(args.nextU64())
        return { activeId, reserveX, reserveY }
      })
  }
}
