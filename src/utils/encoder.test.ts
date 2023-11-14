import { describe } from 'vitest'
import { decodeU256 } from './encoder'

const TRANSFER_EVENT =
  'TRANSFER:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar,AS1jCykeNVigJsLr2QXkYW8cquamU41gPFFydSJTsPRvvjQxUetj,@B\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
const DEPOSIT_EVENT =
  'DEPOSITED_TO_BIN:AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX,8391258,�\r\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000,얇࿨\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
const SWAP_EVENT =
  'SWAP:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar,8391258,true,䄥\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,௟\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00,0,ě\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'

describe('decode', () => {
  test('transfer', () => {
    const [from, to, value] = TRANSFER_EVENT.split(':')[1].split(',')
    const decodedValue = decodeU256(value)

    console.log({ from, to, decodedValue })
    expect(decodedValue).toBe(100000000000n)
  })
  test('deposit', () => {
    const [to, id, amountX, amountY] = DEPOSIT_EVENT.split(':')[1].split(',')
    const decodedAmountX = decodeU256(amountX)
    const decodedAmountY = decodeU256(amountY)

    console.log({ to, id, decodedAmountX, decodedAmountY })
    expect(decodedAmountX).toBe(100000000000n)
    expect(decodedAmountY).toBe(100000000000n)
  })
  test('swap', () => {
    const [
      to,
      activeId,
      swapForY,
      amountInToBin,
      amountOutOfBin,
      volatilityAccumulated,
      feesTotal
    ] = SWAP_EVENT.split(':')[1].split(',')
    const decodedAmountInToBin = decodeU256(amountInToBin)
    const decodedAmountOutOfBin = decodeU256(amountOutOfBin)
    const decodedFeesTotal = decodeU256(feesTotal)

    console.log({
      to,
      activeId,
      swapForY,
      decodedAmountInToBin,
      decodedAmountOutOfBin,
      volatilityAccumulated,
      decodedFeesTotal
    })
    expect(decodedAmountInToBin).toBe(100000000000n)
    expect(decodedAmountOutOfBin).toBe(100000000000n)
    expect(decodedFeesTotal).toBe(100000000000n)
  })
})
