import { IBaseContract } from './base'
import { U64 } from '@massalabs/massa-web3'

export class IVoter extends IBaseContract {
  async lastVoted(tokenIds: number[]): Promise<number[]> {
    const bs = tokenIds.map((id: number) => `lastVoted::${id}`)
    return this.extract(bs).then((r) => {
      const lastVoted: number[] = []
      r.forEach((item) => {
        if (!item?.length) return
        lastVoted.push(Number(U64.fromBytes(item)))
      })
      return lastVoted
    })
  }
}
