import { Token } from './token'

/**
 * Represents the native currency of the chain on which it resides, e.g. ETH, MAS
 */
export class NativeCurrency {
  public readonly decimals: number
  public readonly symbol?: string
  public readonly name?: string
  public readonly isNative: true = true as const
  public readonly isToken: false = false as const
  public readonly chainId: number

  /**
   * Constructs an instance of the base class `NativeCurrency`.
   * @param chainId the chain ID on which this currency resides
   * @param decimals decimals of the currency
   * @param symbol symbol of the currency
   * @param name of the currency
   */
  constructor(
    chainId: number,
    decimals: number,
    symbol?: string,
    name?: string
  ) {
    if (decimals <= 0 || decimals > 255) {
      throw new Error('DECIMALS is not a u8')
    }
    this.chainId = chainId
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
  }

  public equals(other: NativeCurrency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

/*
 * CNATIVE is the main usage of a 'native' currency, i.e. ETH, MAS
 */
export class CNATIVE extends NativeCurrency {
  constructor(chainId: number) {
    const symbol = 'MAS'
    const name = 'Massa'
    super(chainId, 9, symbol, name)
  }
  public equals(other: NativeCurrency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  private static _etherCache: { [chainId: number]: CNATIVE } = {}

  public static onChain(chainId: number): CNATIVE {
    return (
      this._etherCache[chainId] ??
      (this._etherCache[chainId] = new CNATIVE(chainId))
    )
  }
}

/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export type Currency = NativeCurrency | Token
