import { Args, bytesToStr, strToBytes } from '@massalabs/massa-web3'
import {
  ArrayTypes,
  byteToBool,
  bytesToArray,
  bytesToU256
} from '@massalabs/web3-utils'
import { BinReserves, LBPairReservesAndId } from '../types'
import { IBaseContract, coins, fee, maxGas } from './base'

export class ILBPair extends IBaseContract {
  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'setApprovalForAll',
      parameter: new Args().addBool(approved).addString(operator).serialize(),
      maxGas,
      fee,
      coins
    })
  }

  async collectFees(account: string, ids: number[]): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'collectFees',
      parameter: new Args()
        .addString(account)
        .addArray(ids.map(BigInt), ArrayTypes.U64)
        .serialize(),
      maxGas,
      fee,
      coins
    })
  }

  async balanceOf(account: string, id: number): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'balanceOf',
        parameter: new Args().addString(account).addU64(BigInt(id)).serialize(),
        maxGas
      })
      .then((res) => bytesToU256(res.returnValue))
  }

  async balanceOfBatch(accounts: string[], ids: number[]): Promise<bigint[]> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'balanceOfBatch',
        parameter: new Args()
          .addArray(accounts, ArrayTypes.STRING)
          .addArray(ids.map(BigInt), ArrayTypes.U64)
          .serialize(),
        maxGas
      })
      .then((res) => bytesToArray(res.returnValue, ArrayTypes.U256))
  }

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

  async getTokens(): Promise<[string, string]> {
    return this.client
      .publicApi()
      .getDatastoreEntries([
        {
          address: this.address,
          key: strToBytes('TOKEN_X')
        },
        {
          address: this.address,
          key: strToBytes('TOKEN_Y')
        }
      ])
      .then((r) => {
        if (
          !r[0].candidate_value ||
          !r[1].candidate_value ||
          !r[0].candidate_value.length ||
          !r[1].candidate_value.length
        )
          throw new Error()
        return [
          bytesToStr(r[0].candidate_value),
          bytesToStr(r[1].candidate_value)
        ]
      })
  }

  async getSupplies(ids: number[]): Promise<bigint[]> {
    const keys = ids.map((id) => ({
      address: this.address,
      key: strToBytes(`total_supplies::${id}`)
    }))
    return this.client
      .publicApi()
      .getDatastoreEntries(keys)
      .then((res) => {
        return res.map((r) => {
          if (!r.candidate_value || !r.candidate_value.length) return 0n
          const args = new Args(r.candidate_value)
          return args.nextU256()
        })
      })
  }

  async getBins(ids: number[]): Promise<BinReserves[]> {
    const keys = ids.map((id) => ({
      address: this.address,
      key: strToBytes(`bin::${id}`)
    }))
    return this.client
      .publicApi()
      .getDatastoreEntries(keys)
      .then((res) => {
        return res.map((r) => {
          if (!r.candidate_value || !r.candidate_value.length)
            return { reserveX: 0n, reserveY: 0n }
          const args = new Args(r.candidate_value)
          const reserveX = args.nextU256()
          const reserveY = args.nextU256()
          return { reserveX, reserveY }
        })
      })
  }

  async getBin(id: number): Promise<BinReserves> {
    return this.client
      .publicApi()
      .getDatastoreEntries([
        { address: this.address, key: strToBytes(`bin::${id}`) }
      ])
      .then((res) => {
        if (!res[0].candidate_value || !res[0].candidate_value.length)
          return { reserveX: 0n, reserveY: 0n }
        const args = new Args(res[0].candidate_value)
        const reserveX = args.nextU256()
        const reserveY = args.nextU256()
        return { reserveX, reserveY }
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
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'getUserBins',
        parameter: new Args().addString(user).serialize(),
        maxGas
      })
      .then((res) => {
        const args = new Args(res.returnValue)
        const bins: number[] = args.nextArray(ArrayTypes.U32)
        return bins.sort((a, b) => a - b)
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

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'isApprovedForAll',
        parameter: new Args().addString(owner).addString(operator).serialize(),
        maxGas
      })
      .then((res) => byteToBool(res.returnValue))
  }
}
