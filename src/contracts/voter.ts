import { IBaseContract } from './base'
import { Args, ArrayTypes, U64 } from '@massalabs/massa-web3'

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

  vote(
    tokenId: number,
    poolVote: string[],
    weights: bigint[]
  ): Promise<string> {
    return this.call({
      targetFunction: 'vote',
      parameter: new Args()
        .addU64(BigInt(tokenId))
        .addArray(poolVote, ArrayTypes.STRING)
        .addArray(weights, ArrayTypes.U256)
        .serialize()
    })
  }
}
