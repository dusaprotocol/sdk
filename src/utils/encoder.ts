import { bytesToU256 } from '@massalabs/massa-web3'

const strEncodeUTF16 = (str: string): Uint8Array => {
  const buf = new ArrayBuffer(str.length * 2)
  const bufView = new Uint16Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return new Uint8Array(buf)
}

export const decodeU256 = (bytes: string): bigint =>
  bytesToU256(strEncodeUTF16(bytes))
