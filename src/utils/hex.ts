import { CurrencyAmount } from '../v1entities'

/**
 * Converts currency amount into hex encoding
 *
 * @param {CurrencyAmount} currencyAmount
 * @returns {string}
 */
export function toHex(currencyAmount: CurrencyAmount) {
  return `0x${currencyAmount.raw.toString(16)}`
}

/**
 * Returns true if the string value is zero in hex
 *
 * @param {string} hexNumberString
 * @returns {boolean}
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}
