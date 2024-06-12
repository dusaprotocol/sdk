import { describe, it, expect } from 'vitest'
import { EventDecoder } from './eventDecoder'

const DEPOSIT_EVENT =
  'DEPOSITED_TO_BIN:AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX;?!8391258;?!�\r\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000;?!얇࿨\u0001\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000'
const SWAP_EVENT =
  'SWAP:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar;?!8391258;?!true;?!䄥\x0F\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00;?!௟\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00;?!0;?!ě\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
const EVENT = 'SWAP:aaa;?!bbb;?!c:c;?!ddd'
const ERROR_EVENT =
  '{"massa_execution_error":"Runtime error: runtime error when executing operation O1fmxudzfQWK6sFxnoqVJ7LBa4xS28wh7ZLYRgbp3pU2xLtahRt: VM Error in CallSC context: VM execution error: RuntimeError: Runtime error: error transferring 21 coins from AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi to AS1vnaHDB5ixK56S1LPh2nGgsaHXjoeaWuPnh3ggiK6BqTBeGM2B: Runtime error: failed to transfer 21 coins from spending address AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi due to insufficient balance 15.1897"}'

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
  it('u256 with ":" delimiter inside', () => {
    const params = EventDecoder.extractParams(EVENT)
    expect(params.length).toBe(4)
    expect(params[0]).toBe('aaa')
    expect(params[1]).toBe('bbb')
    expect(params[2]).toBe('c:c')
    expect(params[3]).toBe('ddd')
  })
  it('error msg', () => {
    const decodedMsg = EventDecoder.decodeError(ERROR_EVENT)
    expect(decodedMsg).toBe(
      'failed to transfer 21 coins from spending address AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi due to insufficient balance 15.1897'
    )
  })
})
