import { Args, IDeserializedResult, ISerializable } from '@massalabs/massa-web3'

export class Checkpoint implements ISerializable<Checkpoint> {
  constructor(
    public fromTimestamp: number = 0,
    public owner: string = '',
    public delegatedBalance: bigint = 0n,
    public delegatee: number = 0
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addU64(BigInt(this.fromTimestamp))
      .addString(this.owner)
      .addU256(this.delegatedBalance)
      .addU64(BigInt(this.delegatee))
      .serialize()
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<Checkpoint> {
    const args = new Args(data, offset)
    this.fromTimestamp = Number(args.nextU64())
    this.owner = args.nextString()
    this.delegatedBalance = args.nextU256()
    this.delegatee = Number(args.nextU64())

    return { instance: this, offset: args.getOffset() }
  }
}

export class LockedBalance implements ISerializable<LockedBalance> {
  constructor(
    public amount: number = 0,
    public end: number = 0,
    public isPermanent: boolean = false
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addI128(BigInt(this.amount))
      .addU64(BigInt(this.end))
      .addBool(this.isPermanent)
      .serialize()
  }

  deserialize(
    data: Uint8Array,
    offset = 0
  ): IDeserializedResult<LockedBalance> {
    const args = new Args(data, offset)
    this.amount = Number(args.nextI128())
    this.end = Number(args.nextU64())
    this.isPermanent = args.nextBool()

    return { instance: this, offset: args.getOffset() }
  }
}

export class UserPoint implements ISerializable<UserPoint> {
  constructor(
    public bias: bigint = 0n,
    public slope: bigint = 0n, // # -dweight / dt
    public ts: number = 0,
    public blk: number = 0, // block
    public permanent: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addI128(this.bias)
      .addI128(this.slope)
      .addU64(BigInt(this.ts))
      .addU64(BigInt(this.blk))
      .addU256(this.permanent)
      .serialize()
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<UserPoint> {
    const args = new Args(data, offset)
    this.bias = args.nextI128()
    this.slope = args.nextI128()
    this.ts = Number(args.nextU64())
    this.blk = Number(args.nextU64())
    this.permanent = args.nextU256()

    return { instance: this, offset: args.getOffset() }
  }
}

export class GlobalPoint implements ISerializable<GlobalPoint> {
  constructor(
    public bias: bigint = 0n,
    public slope: bigint = 0n, // # -dweight / dt
    public ts: number = 0,
    public blk: number = 0, // block
    public permanentLockBalance: bigint = 0n
  ) {}

  serialize(): Uint8Array {
    return new Args()
      .addI128(this.bias)
      .addI128(this.slope)
      .addU64(BigInt(this.ts))
      .addU64(BigInt(this.blk))
      .addU256(this.permanentLockBalance)
      .serialize()
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<GlobalPoint> {
    const args = new Args(data, offset)
    this.bias = args.nextI128()
    this.slope = args.nextI128()
    this.ts = Number(args.nextU64())
    this.blk = Number(args.nextU64())
    this.permanentLockBalance = args.nextU256()

    return { instance: this, offset: args.getOffset() }
  }
}
