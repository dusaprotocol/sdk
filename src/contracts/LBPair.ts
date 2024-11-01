import {
  Args,
  ArrayTypes,
  bytesToArray,
  bytesToStr,
  byteToBool,
  U256
} from '@massalabs/massa-web3'
import { BinReserves, FeeParameters, LBPairReservesAndId } from '../types'
import { IBaseContract } from './base'

export class ILBPair extends IBaseContract {
  async setApprovalForAll(operator: string, approved: boolean) {
    return this.call({
      targetFunction: 'setApprovalForAll',
      parameter: new Args().addBool(approved).addString(operator).serialize()
    })
  }

  async collectFees(account: string, ids: number[]) {
    return this.call({
      targetFunction: 'collectFees',
      parameter: new Args()
        .addString(account)
        .addArray(ids.map(BigInt), ArrayTypes.U64)
        .serialize()
    })
  }

  async balanceOf(account: string, id: number): Promise<bigint> {
    return this.read({
      targetFunction: 'balanceOf',
      parameter: new Args().addString(account).addU64(BigInt(id)).serialize()
    }).then((res) => U256.fromBytes(res.value))
  }

  async balanceOfBatch(accounts: string[], ids: number[]): Promise<bigint[]> {
    return this.read({
      targetFunction: 'balanceOfBatch',
      parameter: new Args()
        .addArray(accounts, ArrayTypes.STRING)
        .addArray(ids.map(BigInt), ArrayTypes.U32)
        .serialize()
    }).then((res) => bytesToArray(res.value, ArrayTypes.U256))
  }

  async getReservesAndId(): Promise<LBPairReservesAndId> {
    return await this.read({
      targetFunction: 'getPairInformation',
      parameter: new Args().serialize()
    }).then((res) => {
      const args = new Args(res.value)
      const activeId = Number(args.nextU32())
      const reserveX = args.nextU256()
      const reserveY = args.nextU256()
      const feesX = { total: args.nextU256(), protocol: args.nextU256() }
      const feesY = { total: args.nextU256(), protocol: args.nextU256() }
      return { activeId, reserveX, reserveY, feesX, feesY }
    })
  }

  async getTokens(): Promise<[string, string]> {
    return this.extract(['TOKEN_X', 'TOKEN_Y']).then((r) => {
      if (!r[0]?.length || !r[1]?.length) throw new Error()
      return [bytesToStr(r[0]), bytesToStr(r[1])]
    })
  }

  async getSupplies(ids: number[]): Promise<bigint[]> {
    const keys = ids.map((id) => `total_supplies::${id}`)
    return this.extract(keys).then((res) => {
      return res.map((r) => {
        if (!r?.length) return 0n
        return new Args(r).nextU256()
      })
    })
  }

  async getBins(ids: number[]): Promise<BinReserves[]> {
    const keys = ids.map((id) => `bin::${id}`)
    return this.extract(keys).then((res) => {
      return res.map((r) => {
        if (!r?.length) return { reserveX: 0n, reserveY: 0n }
        const args = new Args(r)
        return { reserveX: args.nextU256(), reserveY: args.nextU256() }
      })
    })
  }

  async getBin(id: number): Promise<BinReserves> {
    return this.extract([`bin::${id}`]).then((res) => {
      if (!res[0]?.length) return { reserveX: 0n, reserveY: 0n }
      const args = new Args(res[0])
      return { reserveX: args.nextU256(), reserveY: args.nextU256() }
    })
  }

  async getBinIds(): Promise<number[]> {
    return (this.client as any)
      .getStorageKeys(this.address, 'bin::')
      .then((res: Uint8Array[]) => {
        const keys = res.map((r: Uint8Array) => String.fromCharCode(...r))
        return keys.map((key: string) => Number(key.split('bin::')[1]))
      })
  }

  async getUserBinIds(user: string): Promise<number[]> {
    return this.read({
      targetFunction: 'getUserBins',
      parameter: new Args().addString(user).serialize()
    }).then((res) =>
      new Args(res.value)
        .nextArray<number>(ArrayTypes.U32)
        .sort((a, b) => a - b)
    )
  }

  async pendingFees(
    account: string,
    ids: number[]
  ): Promise<{
    amount0: bigint
    amount1: bigint
  }> {
    return this.read({
      targetFunction: 'pendingFees',
      parameter: new Args()
        .addString(account)
        .addArray(ids.map(BigInt), ArrayTypes.U64)
        .serialize()
    }).then((res) => {
      const args = new Args(res.value)
      return { amount0: args.nextU256(), amount1: args.nextU256() }
    })
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.read({
      targetFunction: 'isApprovedForAll',
      parameter: new Args().addString(owner).addString(operator).serialize()
    }).then((res) => byteToBool(res.value))
  }

  async feeParameters(): Promise<FeeParameters> {
    return this.extract(['FEES_PARAMETERS']).then((res) => {
      if (!res[0] || !res[0].length) throw new Error()
      const args = new Args(res[0])
      return {
        binStep: Number(args.nextU32()),
        baseFactor: Number(args.nextU32()),
        filterPeriod: Number(args.nextU32()),
        decayPeriod: Number(args.nextU32()),
        reductionFactor: Number(args.nextU32()),
        variableFeeControl: Number(args.nextU32()),
        protocolShare: Number(args.nextU32()),
        maxVolatilityAccumulated: Number(args.nextU32()),
        volatilityAccumulated: Number(args.nextU32()),
        volatilityReference: Number(args.nextU32()),
        indexRef: Number(args.nextU32()),
        time: args.nextU64()
      }
    })
  }
}
