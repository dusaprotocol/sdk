import invariant from 'tiny-invariant'
import { ChainId } from '../constants'
import { Currency } from './currency'

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token {
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string
  public readonly isNative: false = false as const
  public readonly isToken: true = true as const
  public readonly chainId: number

  /**
   * The contract address on the chain on which this token lives
   */
  public readonly address: string

  public constructor(
    chainId: ChainId,
    address: string,
    decimals: number,
    symbol?: string,
    name?: string
  ) {
    this.chainId = chainId
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.address = address
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
   * @param other other token to compare
   */
  public equals(other: Token): boolean {
    // short circuit on reference equality
    if (this === other) {
      return true
    }
    return this.chainId == other.chainId && this.address === other.address
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.chainId == other.chainId, 'CHAIN_IDS')
    invariant(this.address !== other.address, 'ADDRESSES')
    return this.address.toLowerCase() < other.address.toLowerCase()
  }
}

/**
 * Compares two currencies for equality
 */
export function currencyEquals(
  currencyA: Currency,
  currencyB: Currency
): boolean {
  if (currencyA instanceof Token && currencyB instanceof Token) {
    return currencyA.equals(currencyB)
  } else if (currencyA instanceof Token) {
    return false
  } else if (currencyB instanceof Token) {
    return false
  } else {
    return currencyA === currencyB
  }
}

const nullToken = new Token(ChainId.MAINNET, '', 0, '', '')

const wmasName = 'Wrapped Massa'
const wmasSymbol = 'WMAS'
const wmasDecimals = 9
export const WMAS: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12FW5Rs5YN2zdpEnqwj4iHUUPt9R4Eqjq2qtpJFNKW3mn33RuLU',
    wmasDecimals,
    wmasSymbol,
    wmasName
  ),
  [ChainId.MAINNET]: nullToken
}

const usdcName = 'USD Coin'
const usdcSymbol = 'USDC.e'
const usdcDecimals = 6
export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12N76WPYB3QNYKGhV2jZuQs1djdhNJLQgnm7m52pHWecvvj1fCQ',
    usdcDecimals,
    usdcSymbol,
    usdcName
  ),
  [ChainId.MAINNET]: nullToken
}

const daiName = 'DAI'
const daiSymbol = 'DAI.e'
const daiDecimals = 18
export const DAI: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS124FuWHWqiWurCvobu5ovTGucWJPa6ouHbGLQ9e7kMwWt2Xsm84',
    daiDecimals,
    daiSymbol,
    daiName
  ),
  [ChainId.MAINNET]: nullToken
}

const wethName = 'Wrapped Ether'
const wethSymbol = 'WETH.e'
const wethDecimals = 18
export const WETH: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12rcqHGQ3bPPhnjBZsYiANv9TZxYp96M7r49iTMUrX8XCJQ8Wrk',
    wethDecimals,
    wethSymbol,
    wethName
  ),
  [ChainId.MAINNET]: nullToken
}
