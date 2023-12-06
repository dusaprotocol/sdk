import { describe, it, expect } from 'vitest'
import { EventDecoder } from './eventDecoder'

const DEPOSIT_EVENT =
  'DEPOSITED_TO_BIN:AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX,8391258,�\r\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000,얇࿨\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
const SWAP_EVENT =
  'SWAP:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar,8391258,true,䄥\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,௟\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,0,ě\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

describe('decode', () => {
  it('deposit', () => {
    const { to, id, amountX, amountY } =
      EventDecoder.decodeLiquidity(DEPOSIT_EVENT)
    expect(to).toBe('AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX')
    expect(id).toBe(8391258)
    expect(amountX).toBe(917501n)
    expect(amountY).toBe(4561880455n)
  })
  it('swap', () => {
    const {
      to,
      activeId,
      swapForY,
      amountInToBin,
      amountOutOfBin,
      volatilityAccumulated,
      feesTotal
    } = EventDecoder.decodeSwap(SWAP_EVENT)
    expect(to).toBe('AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar')
    expect(activeId).toBe(8391258)
    expect(swapForY).toBe(true)
    expect(amountInToBin).toBe(999717n)
    expect(amountOutOfBin).toBe(199222843n)
    expect(volatilityAccumulated).toBe(0)
    expect(feesTotal).toBe(283n)
  })
})
