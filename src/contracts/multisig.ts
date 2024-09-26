import {
  Args,
  bytesToArray,
  ArrayTypes,
  bytesToI32,
  byteToBool,
  bytesToU64,
  bytesToSerializableObjectArray
} from '@massalabs/massa-web3'
import { IBaseContract } from './base'
import { Transaction } from '../types/periphery'

export class IMultisig extends IBaseContract {
  async getTransactions(): Promise<Transaction[]> {
    return this.read({
      targetFunction: 'getTransactions',
      parameter: new Args().serialize()
    }).then((res) =>
      bytesToSerializableObjectArray(res.returnValue, Transaction)
    )
  }

  async getApprovals(txId: bigint): Promise<string[]> {
    return this.read({
      targetFunction: 'getApprovals',
      parameter: new Args().addU64(txId).serialize()
    }).then((res) => bytesToArray(res.returnValue, ArrayTypes.STRING))
  }

  async getApprovalCount(txId: bigint): Promise<number> {
    const _owners = await this.owners()
    let count = 0
    for (let i = 0; i < _owners.length; i++) {
      if (await this.hasApproved(txId, _owners[i])) count++
    }
    return count
  }

  async owners(): Promise<string[]> {
    return this.extract(['owners']).then((res) => {
      if (!res[0]) throw new Error()
      return new Args(res[0]).nextArray(ArrayTypes.STRING)
    })
  }

  async required(): Promise<number> {
    return this.extract(['required']).then((res) => {
      if (!res[0]) throw new Error()
      return bytesToI32(res[0])
    })
  }

  async delay(): Promise<bigint> {
    return this.extract(['delay']).then((res) => {
      if (!res[0]) throw new Error()
      return bytesToU64(res[0])
    })
  }

  async hasApproved(txId: bigint, owner: string): Promise<boolean> {
    return this.extract(['approved::' + txId.toString() + owner]).then(
      (res) => {
        if (!res[0]) throw new Error()
        return byteToBool(res[0])
      }
    )
  }

  async hasApprovedBatch(
    txIds: bigint[],
    owners: string[]
  ): Promise<boolean[]> {
    const res = await this.extract(
      txIds.map((txId, i) => 'approved::' + txId.toString() + owners[i])
    )
    return res.map((r) => (r ? byteToBool(r) : false))
  }

  async submit(
    to: string,
    method: string,
    value: bigint,
    data: Uint8Array
  ): Promise<string> {
    return this.call({
      targetFunction: 'submit',
      parameter: new Args()
        .addString(to)
        .addString(method)
        .addU64(value)
        .addUint8Array(data)
        .serialize()
    })
  }

  async receiveCoins(amount: bigint): Promise<string> {
    return this.call({
      targetFunction: 'receiveCoins',
      parameter: new Args().serialize(),
      coins: amount
    })
  }

  async approve(txId: bigint): Promise<string> {
    return this.call({
      targetFunction: 'approve',
      parameter: new Args().addU64(txId).serialize()
    })
  }

  async execute(txId: bigint): Promise<string> {
    return this.call({
      targetFunction: 'execute',
      parameter: new Args().addU64(txId).serialize()
    })
  }

  async revoke(txId: bigint): Promise<string> {
    return this.call({
      targetFunction: 'revoke',
      parameter: new Args().addU64(txId).serialize()
    })
  }
}
