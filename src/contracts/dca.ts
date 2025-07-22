import { Args, ArrayTypes } from '@massalabs/massa-web3'
import { IBaseContract } from './base'
import { DCA } from '../types/periphery'

export class IDca extends IBaseContract {
  async getDCA(dcaId: bigint, owner: string): Promise<DCA> {
    return this.extract([`D::${owner}:${dcaId}`]).then((res) => {
      if (!res[0] || !res[0].length) throw new Error()
      const args = new Args(res[0])
      return {
        id: Number(dcaId),
        amountEachDCA: args.nextU256(),
        interval: Number(args.nextU64()),
        nbOfDCA: Number(args.nextU64()),
        tokenPath: args.nextArray(ArrayTypes.STRING),
        threshold: Number(args.nextU32()),
        moreGas: args.nextBool(),
        startTime: Number(args.nextU64()),
        endTime: Number(),
        executedCount: Number(args.nextU64()),
        deferredCallId: args.nextString()
      }
    })
  }

  async startDCA(
    amountEachDCA: bigint,
    interval: bigint,
    nbOfDCA: bigint,
    tokenPath: string[],
    threshold: bigint,
    moreGas: boolean,
    startIn = 0n,
    masToSend = 0n
  ) {
    return this.call({
      targetFunction: 'startDCA',
      parameter: new Args()
        .addU256(amountEachDCA)
        .addU64(interval)
        .addU64(nbOfDCA)
        .addArray(tokenPath, ArrayTypes.STRING)
        .addU32(threshold)
        .addBool(moreGas)
        .addU64(startIn)
        .serialize(),
      coins: masToSend
    })
  }

  async stopDCA(dcaId: bigint) {
    return this.call({
      targetFunction: 'stopDCA',
      parameter: new Args().addU64(dcaId).serialize()
    })
  }

  async updateDCA(
    dcaId: bigint,
    amountEachDCA: bigint,
    interval: bigint,
    nbOfDCA: bigint,
    tokenPath: string[],
    threshold: bigint,
    moreGas: boolean,
    masToSend = 0n
  ) {
    return this.call({
      targetFunction: 'updateDCA',
      parameter: new Args()
        .addU64(dcaId)
        .addU256(amountEachDCA)
        .addU64(interval)
        .addU64(nbOfDCA)
        .addArray(tokenPath, ArrayTypes.STRING)
        .addU32(threshold)
        .addBool(moreGas)
        .serialize(),
      coins: masToSend
    })
  }
}
