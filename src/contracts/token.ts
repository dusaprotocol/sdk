import {
  Args,
  bytesToU256,
  bytesToStr,
  byteToU8,
  MassaUnits
} from '@massalabs/massa-web3'
import { IBaseContract, fee, maxGas } from './base'

const coins = MassaUnits.mMassa // 0.001 MAS, to cover storage costs

export class IERC20 extends IBaseContract {
  async balanceOf(address: string): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'balanceOf',
        parameter: new Args().addString(address).serialize(),
        maxGas
      })
      .then((res) => bytesToU256(res.returnValue))
  }

  async allowance(address: string, spender: string): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'allowance',
        parameter: new Args().addString(address).addString(spender).serialize(),
        maxGas
      })
      .then((res) => bytesToU256(res.returnValue))
  }

  async totalSupply(): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'totalSupply',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => bytesToU256(res.returnValue))
  }

  async decimals(): Promise<number> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'decimals',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => byteToU8(res.returnValue))
  }

  async name(): Promise<string> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'name',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => bytesToStr(res.returnValue))
  }

  async symbol(): Promise<string> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'symbol',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => bytesToStr(res.returnValue))
  }

  async approve(
    spender: string,
    amount: bigint = 2n ** 256n - 1n
  ): Promise<string> {
    const owner = this.client.wallet().getBaseAccount()?.address()
    if (!owner) throw new Error('No base account')

    const currentAllowance = await this.allowance(owner, spender)

    if (currentAllowance >= amount) return ''
    amount -= currentAllowance

    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize(),
      maxGas,
      fee,
      coins
    })
  }

  async transfer(to: string, amount: bigint): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'transfer',
      parameter: new Args().addString(to).addU256(amount).serialize(),
      maxGas,
      fee,
      coins
    })
  }
}
