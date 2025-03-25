import { describe, it, expect } from 'vitest'
import { EventDecoder } from './eventDecoder'
import { decodeInsufficientBalance } from '../contracts'

const DEPOSIT_EVENT_BASE64 =
  'REVQT1NJVEVEX1RPX0JJTjpBVTFSdGQ0QkZSTjhzeWlHaWdDd3J1Sk10TWhIV2VidkJxbllGeVBEYzNTVmN0bkpxdllYOz8hODM5MTI1ODs/Ie+/vQ0AAAAAAAAAAAAAAAAAADs/IeyWh+C/qAEAAAAAAAAAAAAAAAAA'
const SWAP_EVENT_BASE64 =
  'U1dBUDpBVTFjQmlyVG5vMUZyTVZwVU1UOTZLaVE5N3dCcXFNMXo5dUpMcjNYWktRd0pqRkxQRWFyOz8hODM5MTI1ODs/IXRydWU7PyHkhKUPAAAAAAAAAAAAAAAAAAA7PyHumLvgr58AAAAAAAAAAAAAAAAAADs/ITA7PyHEmwAAAAAAAAAAAAAAAAAAAA=='
const WITHDRAW_V2_EVENT_BASE64 =
  'DEPOSITED:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar;?!8384337;?!8384355;?!က풥è;?!׵'
const SWAP_V2_EVENT_BASE64 =
  'V1_SWAP:AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar;?!8381303;?!8381300;?!true;?!濁蛲#;?!쫇씴(;?!嘺ኧρ;?!፳Ь;?!ﴼ፷м;?!퐲葚ƣ;?!30000'
const EVENT = 'XXX:aaa;?!bbb;?!c:c;?!ddd'
const ERROR_EVENT1 =
  '{"massa_execution_error":"Runtime error: runtime error when executing operation O1fmxudzfQWK6sFxnoqVJ7LBa4xS28wh7ZLYRgbp3pU2xLtahRt: VM Error in CallSC context: VM execution error: RuntimeError: Runtime error: error transferring 21 coins from AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi to AS1vnaHDB5ixK56S1LPh2nGgsaHXjoeaWuPnh3ggiK6BqTBeGM2B: Runtime error: failed to transfer 21 coins from spending address AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi due to insufficient balance 15.1897"}'
const ERROR_EVENT2 =
  '{"massa_execution_error":"Runtime error: runtime error when executing operation O1FtHYwvQRDSeYCrEnaZeUPPEzf5BeYFb3FBVZGZXJD1454VGP4: VM Error in CallSC context: VM execution error: RuntimeError: Runtime error: error: Storage__NotEnoughCoinsSent: 28804200000, 20000000000 at assembly/libraries/Utils.ts:89 col: 5"}'

describe('decode', () => {
  it('deposit', () => {
    const DEPOSIT_EVENT = Buffer.from(DEPOSIT_EVENT_BASE64, 'base64').toString()
    const { to, id, amountX, amountY } =
      EventDecoder.decodeLiquidity(DEPOSIT_EVENT)
    expect(to).toBe('AU1Rtd4BFRN8syiGigCwruJMtMhHWebvBqnYFyPDc3SVctnJqvYX')
    expect(id).toBe(8391258)
    expect(amountX).toBe(917501n)
    expect(amountY).toBe(4561880455n)
  })
  it('swap', () => {
    const SWAP_EVENT = Buffer.from(SWAP_EVENT_BASE64, 'base64').toString()
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
  it('withdraw v2', () => {
    const WITHDRAWN_EVENT = Buffer.from(
      WITHDRAW_V2_EVENT_BASE64,
      'base64'
    ).toString()
    const { to, startId, endId, amountX, amountY } =
      EventDecoder.decodeLiquidityV2(WITHDRAWN_EVENT)
    expect(to).toBe('AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar')
    expect(startId).toBe(8391258)
    expect(endId).toBe(8391255)
    expect(amountX).toBe(917501n)
    expect(amountY).toBe(4561880455n)
  })
  it('swap', () => {
    const SWAP_EVENT = Buffer.from(SWAP_V2_EVENT_BASE64, 'base64').toString()
    const {
      to,
      activeId,
      swapForY,
      amountInToBin,
      amountOutOfBin,
      volatilityAccumulated,
      feesTotal
    } = EventDecoder.decodeSwapV2(SWAP_EVENT)
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
  it('empty params', () => {
    const params = EventDecoder.extractParams('TRANSFER SUCCESS')
    expect(params.length).toBe(0)
  })
  it('error msg', () => {
    const decodedMsg1 = EventDecoder.decodeError(ERROR_EVENT1)
    expect(decodedMsg1).toBe(
      'failed to transfer 21 coins from spending address AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi due to insufficient balance 15.1897'
    )
    const dec = decodeInsufficientBalance(ERROR_EVENT1)
    expect(dec.diff).toStrictEqual(5810300000n)
    expect(dec.address).toBe(
      'AS127sVzud6Ep2GKH2WL7yLe7wSgCDjTnG8BfoZdQyvwnhNfTqasi'
    )

    const decodedMsg2 = EventDecoder.decodeError(ERROR_EVENT2)
    expect(decodedMsg2).toBe(
      'Storage__NotEnoughCoinsSent: 28804200000, 20000000000'
    )
  })
})
