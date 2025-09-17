import { GlobalPoint, LockedBalance, UserPoint } from '../types/governance'
import { IBaseContract } from './base'
import { Args, bytesToStr, byteToBool, U64, U256 } from '@massalabs/massa-web3'

export class IVotingEscrow extends IBaseContract {
  async ownerOf(tokenId: number): Promise<string> {
    return this.extract(['idToOwner::' + tokenId]).then((r) => {
      if (!r[0].length) throw new Error('Not found')
      return bytesToStr(r[0])
    })
  }
  async balanceOf(user: string): Promise<number> {
    return this.extract(['ownerToNFTokenCount::' + user]).then((r) => {
      if (!r[0].length) throw new Error('Not found')
      return Number(U64.fromBytes(r[0]))
    })
  }
  async getApproved(tokenId: number): Promise<string> {
    return this.extract(['idToApprovals::' + tokenId]).then((r) => {
      if (!r[0].length) throw new Error('Not found')
      return bytesToStr(r[0])
    })
  }
  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.extract(['ownerToOperators::' + owner + operator]).then((r) => {
      if (!r[0].length) throw new Error('Not found')
      return byteToBool(r[0])
    })
  }
  async isApprovedOrOwner(spender: string, tokenId: number): Promise<boolean> {
    return this.read({
      targetFunction: 'isApprovedOrOwner',
      parameter: new Args()
        .addString(spender)
        .addU64(BigInt(tokenId))
        .serialize()
    }).then((r) => byteToBool(r.value))
  }

  async locked(tokenId: number): Promise<LockedBalance> {
    return this.read({
      targetFunction: 'locked',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    }).then((r) => new LockedBalance().deserialize(r.value).instance)
  }
  async userPointHistory(tokenId: number, loc: number): Promise<UserPoint> {
    return this.read({
      targetFunction: 'userPointHistory',
      parameter: new Args()
        .addU64(BigInt(tokenId))
        .addU64(BigInt(loc))
        .serialize()
    }).then((r) => new UserPoint().deserialize(r.value).instance)
  }
  async pointHistory(loc: number): Promise<GlobalPoint> {
    return this.read({
      targetFunction: 'pointHistory',
      parameter: new Args().addU64(BigInt(loc)).serialize()
    }).then((r) => new GlobalPoint().deserialize(r.value).instance)
  }
  async balanceOfNFT(tokenId: number): Promise<bigint> {
    return this.read({
      targetFunction: 'balanceOfNFT',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    }).then((r) => U256.fromBytes(r.value))
  }
  async balanceOfNFTAt(tokenId: number, timestamp: number): Promise<bigint> {
    return this.read({
      targetFunction: 'balanceOfNFTAt',
      parameter: new Args()
        .addU64(BigInt(tokenId))
        .addU64(BigInt(timestamp))
        .serialize()
    }).then((r) => U256.fromBytes(r.value))
  }
  async totalSupply(): Promise<bigint> {
    return this.read({
      targetFunction: 'totalSupply',
      parameter: new Args().serialize()
    }).then((r) => U256.fromBytes(r.value))
  }
  async totalSupplyAt(timestamp: number): Promise<bigint> {
    return this.read({
      targetFunction: 'totalSupplyAt',
      parameter: new Args().addU64(BigInt(timestamp)).serialize()
    }).then((r) => U256.fromBytes(r.value))
  }
  async delegates(tokenId: number): Promise<number> {
    return this.read({
      targetFunction: 'delegates',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    }).then((r) => Number(U64.fromBytes(r.value)))
  }

  async approve(to: string, tokenId: number): Promise<string> {
    return this.call({
      targetFunction: 'approve',
      parameter: new Args().addString(to).addU64(BigInt(tokenId)).serialize()
    })
  }
  async setApprovalForAll(
    operator: string,
    approved: boolean
  ): Promise<string> {
    return this.call({
      targetFunction: 'setApprovalForAll',
      parameter: new Args().addString(operator).addBool(approved).serialize()
    })
  }
  async transferFrom(
    from: string,
    to: string,
    tokenId: number
  ): Promise<string> {
    return this.call({
      targetFunction: 'transferFrom',
      parameter: new Args()
        .addString(from)
        .addString(to)
        .addU64(BigInt(tokenId))
        .serialize()
    })
  }

  depositFor(tokenId: number, amount: bigint): Promise<string> {
    return this.call({
      targetFunction: 'depositFor',
      parameter: new Args().addU64(BigInt(tokenId)).addU256(amount).serialize()
    })
  }
  createLock(amount: bigint, duration: number): Promise<string> {
    return this.call({
      targetFunction: 'createLock',
      parameter: new Args().addU256(amount).addU64(BigInt(duration)).serialize()
    })
  }
  increaseAmount(tokenId: number, amount: bigint): Promise<string> {
    return this.call({
      targetFunction: 'increaseAmount',
      parameter: new Args().addU64(BigInt(tokenId)).addU256(amount).serialize()
    })
  }
  increaseUnlockTime(tokenId: number, lockDuration: number): Promise<string> {
    return this.call({
      targetFunction: 'increaseUnlockTime',
      parameter: new Args()
        .addU64(BigInt(tokenId))
        .addU64(BigInt(lockDuration))
        .serialize()
    })
  }
  withdraw(tokenId: number): Promise<string> {
    return this.call({
      targetFunction: 'withdraw',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    })
  }
  lockPermanent(tokenId: number): Promise<string> {
    return this.call({
      targetFunction: 'lockPermanent',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    })
  }
  unlockPermanent(tokenId: number): Promise<string> {
    return this.call({
      targetFunction: 'unlockPermanent',
      parameter: new Args().addU64(BigInt(tokenId)).serialize()
    })
  }
  delegate(delegator: number, delegatee: number): Promise<string> {
    return this.call({
      targetFunction: 'delegate',
      parameter: new Args()
        .addU64(BigInt(delegator))
        .addU64(BigInt(delegatee))
        .serialize()
    })
  }
}
