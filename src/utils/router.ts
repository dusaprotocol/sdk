import { Args, ArrayTypes } from '@massalabs/web3-utils'
import {
  AddLiquidityParameters,
  Address,
  LIQUIDITY_ROUTER_METHODS,
  LiquidityRouterMethod,
  RemoveLiquidityParameters,
  SWAP_ROUTER_METHODS,
  SwapRouterMethod,
  SwapSettings
} from '../types'
import { WMAS } from '../v1entities'
import { ChainId } from '../constants'

export const isSwapMethod = (str: string): str is SwapRouterMethod =>
  !!SWAP_ROUTER_METHODS.find((method) => str === method)

export const isLiquidtyMethod = (str: string): str is LiquidityRouterMethod =>
  !!LIQUIDITY_ROUTER_METHODS.find((method) => str === method)

const extractAmountInOut = (
  method: SwapRouterMethod,
  args: Args,
  coins: bigint
) => {
  switch (method) {
    case 'swapExactTokensForTokens': {
      const amountIn = args.nextU256()
      const amountOutMin = args.nextU256()
      return { amountIn, amountOut: amountOutMin }
    }
    case 'swapTokensForExactTokens': {
      const amountOut = args.nextU256()
      const amountInMax = args.nextU256()
      return { amountIn: amountInMax, amountOut }
    }
    case 'swapExactMASForTokens': {
      const amountIn = coins
      const amountOutMin = args.nextU256()
      return { amountIn, amountOut: amountOutMin }
    }
    case 'swapExactTokensForMAS': {
      const amountIn = args.nextU256()
      const amountOutMinMAS = args.nextU256()
      return { amountIn, amountOut: amountOutMinMAS }
    }
    case 'swapTokensForExactMAS': {
      const amountOut = args.nextU256()
      const amountInMax = args.nextU256()
      return { amountIn: amountInMax, amountOut }
    }
    case 'swapMASForExactTokens': {
      const amountIn = coins
      const amountOut = args.nextU256()
      return { amountIn, amountOut }
    }
    case 'swapExactMASForTokensSupportingFeeOnTransferTokens': {
      const amountIn = coins
      const amountOutMin = args.nextU256()
      return { amountIn, amountOut: amountOutMin }
    }
    case 'swapExactTokensForMASSupportingFeeOnTransferTokens': {
      const amountIn = args.nextU256()
      const amountOutMinMAS = args.nextU256()
      return { amountIn, amountOut: amountOutMinMAS }
    }
    case 'swapExactTokensForTokensSupportingFeeOnTransferTokens': {
      const amountIn = args.nextU256()
      const amountOutMin = args.nextU256()
      return { amountIn, amountOut: amountOutMin }
    }
    default:
      throw new Error('unknown method: ' + method)
  }
}

export const decodeSwapTx = (
  method: SwapRouterMethod,
  params: Uint8Array,
  coins: bigint
): SwapSettings => {
  const args = new Args(params)
  const { amountIn, amountOut } = extractAmountInOut(method, args, coins)

  const binSteps = args.nextArray<bigint>(ArrayTypes.U64)
  const path = args.nextSerializableObjectArray(Address)
  const to = args.nextString()
  const deadline = Number(args.nextU64())

  return {
    amountIn,
    amountOut,
    binSteps,
    path,
    to,
    deadline
  }
}

export const decodeLiquidityTx = (
  method: LiquidityRouterMethod,
  params: Uint8Array,
  chainId: ChainId
): AddLiquidityParameters | RemoveLiquidityParameters => {
  const isAdd = method === 'addLiquidity' || method === 'addLiquidityMAS'
  const isRemoveMAS = method === 'removeLiquidityMAS'
  const args = new Args(params)
  const token0 = args.nextString()
  const token1 = isRemoveMAS ? WMAS[chainId].address : args.nextString()
  const binStep = args.nextU32()

  if (isAdd) {
    const amount0 = args.nextU256()
    const amount1 = args.nextU256()
    const amount0Min = args.nextU256()
    const amount1Min = args.nextU256()
    const activeIdDesired = Number(args.nextU64())
    const idSlippage = Number(args.nextU64())
    const deltaIds = args.nextArray<number>(ArrayTypes.I64)
    // const distribution0 = args.nextArray<bigint>(ArrayTypes.U256);
    // const distribution1 = args.nextArray<bigint>(ArrayTypes.U256);
    const to = args.nextString()
    const deadline = Number(args.nextU64())

    return {
      token0,
      token1,
      binStep,
      amount0,
      amount1,
      amount0Min,
      amount1Min,
      activeIdDesired,
      idSlippage,
      deltaIds,
      distributionX: [], //distribution0,
      distributionY: [], //distribution1,
      to,
      deadline
    }
  } else {
    const amount0Min = args.nextU256()
    const amount1Min = args.nextU256()
    const ids = args.nextArray<number>(ArrayTypes.U64)
    const amounts = args.nextArray<bigint>(ArrayTypes.U256)
    const to = args.nextString()
    const deadline = Number(args.nextU64())

    return {
      token0,
      token1,
      binStep,
      amount0Min,
      amount1Min,
      ids,
      amounts,
      to,
      deadline
    }
  }
}
