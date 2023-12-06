import { bytesToU256 } from '@massalabs/massa-web3'

const strEncodeUTF16 = (str: string): Uint8Array => {
  const buf = new ArrayBuffer(str.length * 2)
  const bufView = new Uint16Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return new Uint8Array(buf)
}

const extractParams = (bytes: string): string[] =>
  bytes.split(':')[1].split(',')

export class EventDecoder {
  // CORE

  static decodeSwap = (
    bytes: string
  ): {
    to: string
    activeId: number
    swapForY: boolean
    amountInToBin: bigint
    amountOutOfBin: bigint
    volatilityAccumulated: number
    feesTotal: bigint
  } => {
    const [
      to,
      activeId,
      swapForY,
      amountInToBin,
      amountOutOfBin,
      volatilityAccumulated,
      feesTotal
    ] = extractParams(bytes)

    return {
      to,
      activeId: parseInt(activeId),
      swapForY: swapForY === 'true',
      amountInToBin: EventDecoder.decodeU256(amountInToBin),
      amountOutOfBin: EventDecoder.decodeU256(amountOutOfBin),
      volatilityAccumulated: parseInt(volatilityAccumulated),
      feesTotal: EventDecoder.decodeU256(feesTotal)
    }
  }

  static decodeLiquidity = (
    bytes: string
  ): {
    to: string
    id: number
    amountX: bigint
    amountY: bigint
  } => {
    const [to, id, amountX, amountY] = extractParams(bytes)

    return {
      to,
      id: parseInt(id),
      amountX: EventDecoder.decodeU256(amountX),
      amountY: EventDecoder.decodeU256(amountY)
    }
  }

  static decodeCollectFees = (
    bytes: string
  ): {
    caller: string
    to: string
    amountX: bigint
    amountY: bigint
  } => {
    const [caller, to, amountX, amountY] = extractParams(bytes)

    return {
      caller,
      to,
      amountX: EventDecoder.decodeU256(amountX),
      amountY: EventDecoder.decodeU256(amountY)
    }
  }

  // PERIPHERY

  /**
   * Decode start/update/stop DCA events
   * @param bytes
   */
  static decodeDCA = (
    bytes: string
  ): {
    user: string
    id: number
  } => {
    const [user, id] = extractParams(bytes)

    return {
      user,
      id: parseInt(id)
    }
  }

  /**
   * Decode deposit/withdraw autopool events
   * @param bytes
   */
  static decodeVault = (
    bytes: string
  ): {
    from: string
    amountX: bigint
    amountY: bigint
    shares: bigint
  } => {
    const [from, amountX, amountY, shares] = extractParams(bytes)

    return {
      from,
      amountX: EventDecoder.decodeU256(amountX),
      amountY: EventDecoder.decodeU256(amountY),
      shares: EventDecoder.decodeU256(shares)
    }
  }

  /**
   * Decode add/remove limit order events
   * @param bytes
   */
  static decodeLimitOrder = (
    bytes: string
  ): {
    from: string
    id: number
  } => {
    const [from, id] = extractParams(bytes)

    return {
      from,
      id: parseInt(id)
    }
  }

  // MISC

  static decodeU256 = (bytes: string): bigint =>
    bytesToU256(strEncodeUTF16(bytes))

  static decodeError = (bytes: string): string => {
    const errorSplit = bytes.split('error: ')
    return errorSplit[errorSplit.length - 1].split(' at')[0]
  }
}
