import {
  Args,
  ArrayTypes,
  IDeserializedResult,
  ISerializable
} from '@massalabs/massa-web3'
import { Percent, TokenAmount } from '../v1entities/fractions'

export class Quote implements ISerializable<Quote> {
  constructor(
    public route: string[] = [],
    public pairs: string[] = [],
    public binSteps: bigint[] = [],
    public amounts: bigint[] = [],
    public virtualAmountsWithoutSlippage: bigint[] = [],
    public fees: bigint[] = []
  ) {}

  serialize(): Uint8Array {
    const args = new Args()
    args.addArray(this.route, ArrayTypes.STRING)
    args.addArray(this.pairs, ArrayTypes.STRING)
    args.addArray(this.binSteps, ArrayTypes.U64)
    args.addArray(this.amounts, ArrayTypes.U256)
    args.addArray(this.virtualAmountsWithoutSlippage, ArrayTypes.U256)
    args.addArray(this.fees, ArrayTypes.U256)
    return Uint8Array.from(args.serialize())
  }

  deserialize(data: Uint8Array, offset = 0): IDeserializedResult<Quote> {
    const args = new Args(data, offset)

    this.route = args.nextArray(ArrayTypes.STRING)
    this.pairs = args.nextArray(ArrayTypes.STRING)
    this.binSteps = args.nextArray(ArrayTypes.U64)
    this.amounts = args.nextArray(ArrayTypes.U256)
    this.virtualAmountsWithoutSlippage = args.nextArray(ArrayTypes.U256)
    this.fees = args.nextArray(ArrayTypes.U256)

    return {
      instance: this,
      offset: args.getOffset()
    }
  }
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
  tokenPath: string[]
}

export const SWAP_ROUTER_METHODS = [
  'swapExactMASForTokens',
  'swapExactTokensForMAS',
  'swapExactTokensForTokens',
  'swapMASForExactTokens',
  'swapTokensForExactMAS',
  'swapTokensForExactTokens',
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

export interface SwapSettings {
  amountIn: bigint
  amountOut: bigint
  binSteps: bigint[]
  path: string[]
  to: string
  deadline: number
}

export interface TradeFee {
  totalFeePct: Percent
  feeAmountIn: TokenAmount
}
