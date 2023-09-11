import { Args } from '@massalabs/massa-web3'
import { Percent, TokenAmount } from '../v1entities/fractions'
import { Address } from './serializable'

/** Interface representing a quote */
export interface Quote {
  route: string[]
  pairs: string[]
  binSteps: bigint[]
  amounts: bigint[]
  virtualAmountsWithoutSlippage: bigint[]
  fees: bigint[]
}

/** Options for producing the arguments to send call to the router. */
export interface TradeOptions {
  // How much the execution price is allowed to move unfavorably from the trade execution price.
  allowedSlippage: Percent
  // How long the swap is valid until it expires, in milliseconds. Used to produce a `deadline` parameter which is computed from when the swap call parameters are generated
  ttl: number
  // The account that should receive the output of the swap.
  recipient: string
  // Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
  feeOnTransfer?: boolean
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  // When the transaction expires. This is an atlernate to specifying the ttl, for when you do not want to use local time.
  deadline: number
}

export interface RouterPathParameters {
  pairBinSteps: string[]
  tokenPath: Address[]
}

export const SWAP_ROUTER_METHODS = [
  'swapExactMASForTokens',
  'swapExactTokensForMAS',
  'swapExactTokensForTokens',
  'swapMASForExactTokens',
  'swapTokensForExactMAS',
  'swapTokensForExactTokens',

  // not supported yet
  'swapExactMASForTokensSupportingFeeOnTransferTokens',
  'swapExactTokensForMASSupportingFeeOnTransferTokens',
  'swapExactTokensForTokensSupportingFeeOnTransferTokens'
] as const
export type SwapRouterMethod = (typeof SWAP_ROUTER_METHODS)[number]

/** The parameters to use in the call to the DEX Router to execute a trade. */
export interface SwapParameters {
  // The method to call on LBRouter
  methodName: SwapRouterMethod
  // The arguments to pass to the method, all hex encoded.
  args: Args
  // The amount of nano to send.
  value: bigint
}

export interface TradeFee {
  totalFeePct: Percent
  feeAmountIn: TokenAmount
}
