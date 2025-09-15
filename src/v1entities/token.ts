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
    if (this === other) return true

    return this.chainId == other.chainId && this.address === other.address
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
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS12U4TZfNK7qoLyEERBBRDMu8nm5MKoRzPXDXans4v9wdATZedz9',
    wmasDecimals,
    wmasSymbol,
    wmasName
  )
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
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS1hCJXjndR4c9vekLWsXGnrdigp4AaZ7uYG3UKFzzKnWVsrNLPJ',
    usdcDecimals,
    usdcSymbol,
    usdcName
  )
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
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS1ZGF1upwp9kPRvDKLxFAKRebgg7b3RWDnhgV7VvdZkZsUL7Nuv',
    daiDecimals,
    daiSymbol,
    daiName
  )
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
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS124vf3YfAJCSCQVYKczzuWWpXrximFpbTmX4rheLs5uNSftiiRY',
    wethDecimals,
    wethSymbol,
    wethName
  )
}

export const WETH_B: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12RmCXTA9NZaTBUBnRJuH66AGNmtEfEoqXKxLdmrTybS6GFJPFs',
    wethDecimals,
    'WETH.bt',
    wethName
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS125oPLYRTtfVjpWisPZVTLjBhCFfQ1jDsi75XNtRm1NZux54eCj',
    wethDecimals,
    'WETH.b',
    wethName
  )
}

const usdtName = 'Binance-peg USD'
const usdtDecimals = 18
export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS12ix1Qfpue7BB8q6mWVtjNdNE9UV3x4MaUo7WhdUubov8sJ3CuP',
    usdtDecimals,
    'USDT.bt',
    usdtName
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS12LKs9txoSSy8JgFJgV96m8k5z9pgzjYMYSshwN67mFVuj3bdUV',
    usdtDecimals,
    'USDT.b',
    usdtName
  )
}

const wbtcName = 'Wrapped Bitcoin'
const wbtcDecimals = 8
export const WBTC: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    'AS1ZXy3nvqXAMm2w6viAg7frte6cZfJM8hoMvWf4KoKDzvLzYKqE',
    wbtcDecimals,
    'WBTC.s',
    wbtcName
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS12fr54YtBY575Dfhtt7yftpT8KXgXb1ia5Pn1LofoLFLf9WcjGL',
    wbtcDecimals,
    'WBTC.e',
    wbtcName
  )
}

const dusaName = 'DUSA Coin'
const dusaSymbol = 'DUSA'
const dusaDecimals = 18
export const DUSA: { [chainId in ChainId]: Token } = {
  [ChainId.BUILDNET]: new Token(
    ChainId.BUILDNET,
    '',
    dusaDecimals,
    dusaSymbol,
    dusaName
  ),
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    'AS12HT1JQUne9nkHevS9Q7HcsoAaYLXWPNgoWPuruV7Gw6Mb92ACL',
    dusaDecimals,
    dusaSymbol,
    dusaName
  )
}
