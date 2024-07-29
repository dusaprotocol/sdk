import { Args, bytesToStr } from '@massalabs/massa-web3'
import {
  ArrayTypes,
  byteToBool,
  bytesToArray,
  bytesToU256
} from '@massalabs/web3-utils'
import { BinReserves, FeeParameters, LBPairReservesAndId } from '../types'
import { IBaseContract, maxGas } from './base'

export class ILBPair extends IBaseContract {
  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<string> {
    return this.call({
      targetFunction: 'setApprovalForAll',
      parameter: new Args().addBool(approved).addString(operator).serialize()
    })
  }

  async collectFees(account: string, ids: number[]): Promise<string> {
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
      parameter: new Args().addString(account).addU64(BigInt(id)).serialize(),
      maxGas
    }).then((res) => bytesToU256(res.returnValue))
  }

  async balanceOfBatch(accounts: string[], ids: number[]): Promise<bigint[]> {
    return this.read({
      targetFunction: 'balanceOfBatch',
      parameter: new Args()
        .addArray(accounts, ArrayTypes.STRING)
        .addArray(ids.map(BigInt), ArrayTypes.U64)
        .serialize(),
      maxGas
    }).then((res) => bytesToArray(res.returnValue, ArrayTypes.U256))
  }

  async getReservesAndId(): Promise<LBPairReservesAndId> {
    return await this.read({
      targetFunction: 'getPairInformation',
      parameter: new Args(),
      maxGas
    }).then((res) => {
      const args = new Args(res.returnValue)
      const activeId = args.nextU32()
      const reserveX = args.nextU256()
      const reserveY = args.nextU256()
      const feesX = { total: args.nextU256(), protocol: args.nextU256() }
      const feesY = { total: args.nextU256(), protocol: args.nextU256() }
      return { activeId, reserveX, reserveY, feesX, feesY }
    })
  }

  async getTokens(): Promise<[string, string]> {
    return this.extract(['TOKEN_X', 'TOKEN_Y']).then((r) => {
      if (!r[0] || !r[1] || !r[0].length || !r[1].length) throw new Error()
      return [bytesToStr(r[0]), bytesToStr(r[1])]
    })
  }

  async getSupplies(ids: number[]): Promise<bigint[]> {
    const keys = ids.map((id) => `total_supplies::${id}`)
    return this.extract(keys).then((res) => {
      return res.map((r) => {
        if (!r || !r.length) return 0n
        return new Args(r).nextU256()
      })
    })
  }

  async getBins(ids: number[]): Promise<BinReserves[]> {
    const keys = ids.map((id) => `bin::${id}`)
    return this.extract(keys).then((res) => {
      return res.map((r) => {
        if (!r || !r.length) return { reserveX: 0n, reserveY: 0n }
        const args = new Args(r)
        return { reserveX: args.nextU256(), reserveY: args.nextU256() }
      })
    })
  }

  async getBin(id: number): Promise<BinReserves> {
    return this.extract([`bin::${id}`]).then((res) => {
      if (!res[0] || !res[0].length) return { reserveX: 0n, reserveY: 0n }
      const args = new Args(res[0])
      return { reserveX: args.nextU256(), reserveY: args.nextU256() }
    })
  }

  async getBinIds(): Promise<number[]> {
    return this.client
      .publicApi()
      .getAddresses([this.address])
      .then((res) => {
        const keys = res[0].candidate_datastore_keys.map((key) =>
          String.fromCharCode(...key)
        )
        return keys
          .filter((key) => key.startsWith('bin::'))
          .map((key) => Number(key.split('bin::')[1]))
      })
  }

  async getUserBinIds(user: string): Promise<number[]> {
    return this.read({
      targetFunction: 'getUserBins',
      parameter: new Args().addString(user).serialize(),
      maxGas
    }).then((res) =>
      new Args(res.returnValue)
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
        .serialize(),
      maxGas
    }).then((res) => {
      const args = new Args(res.returnValue)
      return { amount0: args.nextU256(), amount1: args.nextU256() }
    })
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.read({
      targetFunction: 'isApprovedForAll',
      parameter: new Args().addString(owner).addString(operator).serialize(),
      maxGas
    }).then((res) => byteToBool(res.returnValue))
  }

  async feeParameters(): Promise<FeeParameters> {
    return this.extract(['FEES_PARAMETERS']).then((res) => {
      if (!res[0] || !res[0].length) throw new Error()
      const args = new Args(res[0])
      return {
        binStep: args.nextU32(),
        baseFactor: args.nextU32(),
        filterPeriod: args.nextU32(),
        decayPeriod: args.nextU32(),
        reductionFactor: args.nextU32(),
        variableFeeControl: args.nextU32(),
        protocolShare: args.nextU32(),
        maxVolatilityAccumulated: args.nextU32(),
        volatilityAccumulated: args.nextU32(),
        volatilityReference: args.nextU32(),
        indexRef: args.nextU32(),
        time: args.nextU64()
      }
    })
  }
}
