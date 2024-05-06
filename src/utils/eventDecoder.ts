import { bytesToU256 } from '@massalabs/massa-web3'

const strEncodeUTF16 = (str: string): Uint8Array => {
  const buf = new ArrayBuffer(str.length * 2)
  const bufView = new Uint16Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return new Uint8Array(buf)
}

const keywordDelimiter = ':'
const argsDelimiter = ';?!'

export type SwapEvent = {
  to: string
  activeId: number
  swapForY: boolean
  amountInToBin: bigint
  amountOutOfBin: bigint
  volatilityAccumulated: number
  feesTotal: bigint
}

export type LiquidityEvent = {
  to: string
  id: number
  amountX: bigint
  amountY: bigint
}

export type CompositionFeeEvent = {
  to: string
  id: number
  activeFeeX: bigint
  activeFeeY: bigint
}

export type CollectFeesEvent = {
  caller: string
  to: string
  amountX: bigint
  amountY: bigint
}

export type DCAEvent = {
  user: string
  id: number
}

export type DCAExecutionEvent = {
  user: string
  id: number
  amountOut: bigint
}

export type VaultEvent = {
  from: string
  amountX: bigint
  amountY: bigint
  shares: bigint
}

export type LimitOrderEvent = {
  id: number
}

export type LimitOrderExecutionEvent = {
  id: number
  amountOut: bigint
}

export class EventDecoder {
  // CORE

  static decodeSwap = (bytes: string): SwapEvent => {
    const [
      to,
      activeId,
      swapForY,
      amountInToBin,
      amountOutOfBin,
      volatilityAccumulated,
      feesTotal
    ] = EventDecoder.extractParams(bytes)

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

  static decodeLiquidity = (bytes: string): LiquidityEvent => {
    const [to, id, amountX, amountY] = EventDecoder.extractParams(bytes)

    return {
      to,
      id: parseInt(id),
      amountX: EventDecoder.decodeU256(amountX),
      amountY: EventDecoder.decodeU256(amountY)
    }
  }

  static decodeCompositionFee = (bytes: string): CompositionFeeEvent => {
    const [to, id, activeFeeX, activeFeeY] = EventDecoder.extractParams(bytes)

    return {
      to,
      id: parseInt(id),
      activeFeeX: EventDecoder.decodeU256(activeFeeX),
      activeFeeY: EventDecoder.decodeU256(activeFeeY)
    }
  }

  static decodeCollectFees = (bytes: string): CollectFeesEvent => {
    const [caller, to, amountX, amountY] = EventDecoder.extractParams(bytes)

    return {
      caller,
      to,
      amountX: EventDecoder.decodeU256(amountX),
      amountY: EventDecoder.decodeU256(amountY)
    }
  }

  static decodeCreateLBPair(bytes: string): {
    pair: string
    tokenX: string
    tokenY: string
    binStep: number
  } {
    const [pair, tokenX, tokenY, binStep] = EventDecoder.extractParams(bytes)

    return {
      pair,
      tokenX,
      tokenY,
      binStep: parseInt(binStep)
    }
  }

  static decodeLBTransfer(bytes: string): {
    sender: string
    from: string
    to: string
    id: number
    amount: bigint
  } {
    const [sender, from, to, id, amount] = EventDecoder.extractParams(bytes)

    return {
      sender,
      from,
      to,
      id: parseInt(id),
      amount: EventDecoder.decodeU256(amount)
    }
  }

  // PERIPHERY

  /**
   * Decode start/update/stop DCA events
   * @param bytes
   */
  static decodeDCA = (bytes: string): DCAEvent => {
    const [user, id] = EventDecoder.extractParams(bytes)

    return {
      user,
      id: parseInt(id)
    }
  }

  static decodeDCAExecution = (bytes: string): DCAExecutionEvent => {
    const [user, id, amountOut] = EventDecoder.extractParams(bytes)

    return {
      user,
      id: parseInt(id),
      amountOut: EventDecoder.decodeU256(amountOut)
    }
  }

  /**
   * Decode deposit/withdraw autopool events
   * @param bytes
   */
  static decodeVault = (bytes: string): VaultEvent => {
    const [from, amountX, amountY, shares] = EventDecoder.extractParams(bytes)

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
  static decodeLimitOrder = (bytes: string): LimitOrderEvent => {
    const [id] = EventDecoder.extractParams(bytes)

    return {
      id: parseInt(id)
    }
  }

  static decodeLimitOrderExecution = (
    bytes: string
  ): LimitOrderExecutionEvent => {
    const [id, amountOut] = EventDecoder.extractParams(bytes)

    return {
      id: parseInt(id),
      amountOut: EventDecoder.decodeU256(amountOut)
    }
  }

  // MISC

  static decodeU256 = (bytes: string): bigint =>
    bytesToU256(strEncodeUTF16(bytes))

  static decodeError = (bytes: string): string => {
    const errorSplit = bytes.split('error: ')
    return errorSplit[errorSplit.length - 1].split(' at')[0]
  }

  static extractParams = (bytes: string): string[] => {
    return bytes
      .split(keywordDelimiter)
      .slice(1)
      .join(keywordDelimiter)
      .split(argsDelimiter)
  }
}
