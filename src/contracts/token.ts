import {
  Args,
  bytesToStr,
  MRC20AllowanceCreationCost,
  MRC20BalanceCreationCost,
  U256,
  U8
} from '@massalabs/massa-web3'
import { IBaseContract } from './base'
import { validateAddress } from '../utils'

/**
 * Calls that create a balance or allowance entry pass its storage cost in
 * `storageCoins`. At MIP-0002 activation, WMAS is replaced by MRC20 0.1.0, which
 * reverts with `SPENT_MORE_COINS_THAN_SENT` when a new entry is not paid for: the
 * cost is then sent, and the unused coins are refunded. Other tokens keep their
 * code, pay for the entry themselves and receive no coins (see IBaseContract.call).
 * MRC20 0.1.0 also deletes a balance entry when it reaches 0: the next transfer to
 * that holder pays for the entry again.
 */
export class IERC20 extends IBaseContract {
  private get caller(): string {
    return (this.client as any).address
  }

  async balanceOf(address: string): Promise<bigint> {
    if (!validateAddress(address)) {
      throw new Error(`Invalid address: ${address}`)
    }
    return this.read({
      targetFunction: 'balanceOf',
      parameter: new Args().addString(address).serialize()
    }).then((res) => U256.fromBytes(res.value))
  }

  async allowance(address: string, spender: string): Promise<bigint> {
    if (!validateAddress(address)) {
      throw new Error(`Invalid owner address: ${address}`)
    }
    if (!validateAddress(spender)) {
      throw new Error(`Invalid spender address: ${spender}`)
    }
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
    if (!validateAddress(owner)) {
      throw new Error(`Invalid owner address: ${owner}`)
    }
    if (!validateAddress(spender)) {
      throw new Error(`Invalid spender address: ${spender}`)
    }
    // increaseAllowance sets the allowance of the caller
    if (owner !== this.caller) {
      throw new Error(`Owner ${owner} is not the caller ${this.caller}`)
    }
    const currentAllowance = await this.allowance(owner, spender)

    if (currentAllowance >= amount) return
    amount -= currentAllowance

    return this.call({
      targetFunction: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize(),
      storageCoins: await MRC20AllowanceCreationCost(
        this.client,
        this.address,
        owner,
        spender
      )
    })
  }

  async increaseAllowance(spender: string, amount: bigint) {
    if (!validateAddress(spender)) {
      throw new Error(`Invalid spender address: ${spender}`)
    }
    return this.call({
      targetFunction: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize(),
      storageCoins: await MRC20AllowanceCreationCost(
        this.client,
        this.address,
        this.caller,
        spender
      )
    })
  }

  async decreaseAllowance(spender: string, amount: bigint) {
    if (!validateAddress(spender)) {
      throw new Error(`Invalid spender address: ${spender}`)
    }
    return this.call({
      targetFunction: 'decreaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize()
    })
  }

  async transfer(to: string, amount: bigint) {
    if (!validateAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`)
    }
    return this.call({
      targetFunction: 'transfer',
      parameter: new Args().addString(to).addU256(amount).serialize(),
      storageCoins: await MRC20BalanceCreationCost(
        this.client,
        this.address,
        to
      )
    })
  }

  async transferFrom(from: string, to: string, amount: bigint) {
    if (!validateAddress(from)) {
      throw new Error(`Invalid sender address: ${from}`)
    }
    if (!validateAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`)
    }
    return this.call({
      targetFunction: 'transferFrom',
      parameter: new Args()
        .addString(from)
        .addString(to)
        .addU256(amount)
        .serialize(),
      storageCoins: await MRC20BalanceCreationCost(
        this.client,
        this.address,
        to
      )
    })
  }

  async mint(to: string, amount: bigint) {
    if (!validateAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`)
    }
    return this.call({
      targetFunction: 'mint',
      parameter: new Args().addString(to).addU256(amount).serialize(),
      storageCoins: await MRC20BalanceCreationCost(
        this.client,
        this.address,
        to
      )
    })
  }

  async burn(amount: bigint) {
    return this.call({
      targetFunction: 'burn',
      parameter: new Args().addU256(amount).serialize()
    })
  }
}
