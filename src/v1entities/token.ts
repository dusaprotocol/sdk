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
    return this.chainId === other.chainId && this.address === other.address
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: Token): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
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
  [ChainId.DUSANET]: nullToken,
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12Xamqmb2hYBMQZZMn4rqdv3hdQNAfWSfr28ZP2Y3jfXiEZmWEM',
    wmasDecimals,
    wmasSymbol,
    wmasName
  ),
  [ChainId.TESTNET]: nullToken,
  [ChainId.MAINNET]: nullToken
}

const usdcName = 'USD Coin'
const usdcSymbol = 'USDC'
const usdcDecimals = 6
export const USDC: { [chainId in ChainId]: Token } = {
  [ChainId.DUSANET]: nullToken,
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS1247c9yfCLasaScxovEiipMX4ZBMUHU3PNtiiLeUKUGrdosinmD',
    usdcDecimals,
    usdcSymbol,
    usdcName
  ),
  [ChainId.TESTNET]: nullToken,
  [ChainId.MAINNET]: nullToken
}

const usdtName = 'Tether USD'
const usdtSymbol = 'USDT'
const usdtDecimals = 6
export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.DUSANET]: nullToken,
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12VXvGCW3RS78i3dGVAs8ptHcEUpv7HdmSG3Csm1uJMVUFmYtsr',
    usdtDecimals,
    usdtSymbol,
    usdtName
  ),
  [ChainId.TESTNET]: nullToken,
  [ChainId.MAINNET]: nullToken
}

const wethName = 'Wrapped Ether'
const wethSymbol = 'WETH'
const wethDecimals = 18
export const WETH: { [chainId in ChainId]: Token } = {
  [ChainId.DUSANET]: nullToken,
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS1ideTh4Uj6aQPpHFvma8gHeBFErEyvA4Z3ZCqc9PhgbZYW2aXm',
    wethDecimals,
    wethSymbol,
    wethName
  ),
  [ChainId.TESTNET]: nullToken,
  [ChainId.MAINNET]: nullToken
}

const btcName = 'Bitcoin'
const btcSymbol = 'WBTC'
const btcDecimals = 8
export const WBTC: { [chainId in ChainId]: Token } = {
  [ChainId.DUSANET]: nullToken,
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS1mvQfASJz8haWtRquHcyjwmG5YDpSdr2qSsvGZkC5dgGyB2QkN',
    btcDecimals,
    btcSymbol,
    btcName
  ),
  [ChainId.TESTNET]: nullToken,
  [ChainId.MAINNET]: nullToken
}
