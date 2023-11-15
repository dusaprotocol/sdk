import { describe } from 'vitest'
import { EventDecoder } from './eventDecoder'

const TRANSFER_EVENT =
  'TRANSFER:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar,AS1jCykeNVigJsLr2QXkYW8cquamU41gPFFydSJTsPRvvjQxUetj,@B\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
const DEPOSIT_EVENT =
  'DEPOSITED_TO_BIN:AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX,8391258,�\r\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000,얇࿨\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
const SWAP_EVENT =
  'SWAP:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar,8391258,true,䄥\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,௟\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,0,ě\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

describe('decode', () => {
  test('transfer', () => {
    const { from, to, amount } = EventDecoder.decodeTransfer(TRANSFER_EVENT)
    expect(from).toBe('AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar')
    expect(to).toBe('AS1jCykeNVigJsLr2QXkYW8cquamU41gPFFydSJTsPRvvjQxUetj')
    expect(amount).toBe(100000000000n)
  })
  test('deposit', () => {
    const { to, id, amountX, amountY } =
      EventDecoder.decodeLiquidity(DEPOSIT_EVENT)
    expect(to).toBe('AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX')
    expect(id).toBe(8391258)
    expect(amountX).toBe(100000000000n)
    expect(amountY).toBe(100000000000n)
  })
  test('swap', () => {
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
    expect(amountInToBin).toBe(100000000000n)
    expect(amountOutOfBin).toBe(100000000000n)
    expect(volatilityAccumulated).toBe(0)
    expect(feesTotal).toBe(100000000000n)
  })
})
