import { describe, it, expect } from 'vitest'
import { USDC as _USDC, WETH as _WETH } from '../v1entities'
import { WMAS as _WMAS } from '../v1entities'
import { LBPairInformation } from '../types'

describe('', () => {
  it('', () => {
    const arr = [
      25, 0, 0, 0, 53, 0, 0, 0, 65, 83, 49, 50, 66, 105, 82, 120, 53, 110, 113,
      55, 113, 112, 65, 104, 121, 52, 111, 71, 106, 66, 90, 102, 120, 84, 68,
      87, 112, 101, 68, 72, 69, 70, 110, 119, 87, 89, 97, 76, 78, 68, 49, 107,
      113, 50, 109, 55, 83, 52, 99, 109, 67, 0, 0
    ]

    // offset 0
    const a = Uint8Array.from(arr)

    // offset arr length
    const byteOffset = 70
    const _b = new Uint8Array(63)
    _b.set(arr)
    const b = new Uint8Array(
      new ArrayBuffer(arr.length + byteOffset),
      byteOffset,
      arr.length
    )
    b.set(_b)

    console.log(a.byteOffset, b.byteOffset)

    expect(1).toBe(1)

    // fixed
    // const aDec = new LBPairInformation().deserialize(a).instance
    // const _bDec = new LBPairInformation().deserialize(b).instance
    // const bDec = new LBPairInformation().deserialize(new Uint8Array(b)).instance
    // expect(aDec.LBPair).toEqual(bDec.LBPair)
    // expect(aDec.LBPair).not.toEqual(_bDec.LBPair)
    // expect(aDec.binStep).toEqual(bDec.binStep)
    // expect(aDec.binStep).not.toEqual(_bDec.binStep)
  })
})
