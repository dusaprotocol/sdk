import { Args, bytesToStr, U256, U8 } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class IERC20 extends IBaseContract {
  async balanceOf(address: string): Promise<bigint> {
    return this.read({
      targetFunction: 'balanceOf',
      parameter: new Args().addString(address).serialize()
    }).then((res) => U256.fromBytes(res.value))
  }

  async allowance(address: string, spender: string): Promise<bigint> {
    return this.read({
      targetFunction: 'allowance',
      parameter: new Args().addString(address).addString(spender).serialize()
    }).then((res) => U256.fromBytes(res.value))
  }

  async totalSupply(): Promise<bigint> {
    return this.read({
      targetFunction: 'totalSupply',
      parameter: new Args().serialize()
    }).then((res) => U256.fromBytes(res.value))
  }

  async decimals(): Promise<number> {
    return this.read({
      targetFunction: 'decimals',
      parameter: new Args().serialize()
    }).then((res) => Number(U8.fromBytes(res.value)))
  }

  async name(): Promise<string> {
    return this.read({
      targetFunction: 'name',
      parameter: new Args().serialize()
    }).then((res) => bytesToStr(res.value))
  }

  async symbol(): Promise<string> {
    return this.read({
      targetFunction: 'symbol',
      parameter: new Args().serialize()
    }).then((res) => bytesToStr(res.value))
  }

  async approve(
    owner: string,
    spender: string,
    amount: bigint = 2n ** 256n - 1n
  ) {
    const currentAllowance = await this.allowance(owner, spender)

    if (currentAllowance >= amount) return
    amount -= currentAllowance

    return this.call({
      targetFunction: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize()
    })
  }

  async increaseAllowance(spender: string, amount: bigint) {
    return this.call({
      targetFunction: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize()
    })
  }

  async decreaseAllowance(spender: string, amount: bigint) {
    return this.call({
      targetFunction: 'decreaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize()
    })
  }

  async transfer(to: string, amount: bigint) {
    return this.call({
      targetFunction: 'transfer',
      parameter: new Args().addString(to).addU256(amount).serialize()
    })
  }

  async transferFrom(from: string, to: string, amount: bigint) {
    return this.call({
      targetFunction: 'transferFrom',
      parameter: new Args()
        .addString(from)
        .addString(to)
        .addU256(amount)
        .serialize()
    })
  }

  async mint(to: string, amount: bigint) {
    return this.call({
      targetFunction: 'mint',
      parameter: new Args().addString(to).addU256(amount).serialize()
    })
  }

  async burn(amount: bigint) {
    return this.call({
      targetFunction: 'burn',
      parameter: new Args().addU256(amount).serialize()
    })
  }
}
