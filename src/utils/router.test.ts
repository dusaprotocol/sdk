import { describe, it, expect } from 'vitest'
import {
  decodeLiquidityTx,
  decodeSwapTx,
  isLiquidtyMethod,
  isSwapMethod
} from './router'
import {
  AddLiquidityParameters,
  BaseLiquidityParameters,
  LIQUIDITY_ROUTER_METHODS,
  RemoveLiquidityParameters,
  SWAP_ROUTER_METHODS
} from '../types'
import { ChainId } from '../constants'
import {
  Percent,
  Token,
  TokenAmount,
  USDC as _USDC,
  WMAS as _WMAS
} from '../v1entities'
import { parseUnits } from '../lib/ethers'
import { QuoterHelper } from './quoterHelper'
import { Account, JsonRpcProvider } from '@massalabs/massa-web3'
import { PairV2 } from '../v2entities'
import invariant from 'tiny-invariant'

describe('isSwapMethod', () => {
  it('should return true for valid swap method', () => {
    expect(SWAP_ROUTER_METHODS.map(isSwapMethod).every(Boolean)).toBe(true)
  })
  it('should return false for invalid swap method', () => {
    expect(isSwapMethod('swapExactTokensForTokenss')).toBe(false)
  })
})
describe('isLiquidtyMethod', () => {
  it('should return true for valid liquidity method', () => {
    expect(LIQUIDITY_ROUTER_METHODS.map(isLiquidtyMethod).every(Boolean)).toBe(
      true
    )
  })
  it('should return false for invalid liquidity method', () => {
    expect(isLiquidtyMethod('addLiquidityy')).toBe(false)
  })
})

describe('decodeSwapTx', async () => {
  const CHAIN_ID = ChainId.MAINNET
  const baseAccount = await Account.generate()
  const client = JsonRpcProvider.mainnet(baseAccount)
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const options = {
    allowedSlippage: new Percent(50n, 10000n),
    ttl: 1000,
    recipient: '0'
  }

  const decode = async (
    inputToken: Token,
    outputToken: Token,
    typedValueInParsed: string
  ) => {
    const amountIn = new TokenAmount(inputToken, typedValueInParsed)
    const isNativeIn = inputToken === _WMAS[CHAIN_ID]
    const isNativeOut = outputToken === _WMAS[CHAIN_ID]
    const bestTrade = await QuoterHelper.findBestPath(
      inputToken,
      isNativeIn,
      outputToken,
      isNativeOut,
      amountIn,
      true,
      2,
      client,
      CHAIN_ID
    )
    const params = bestTrade.swapCallParameters(options)

    const decoded = decodeSwapTx(
      params.methodName,
      params.args.serialize(),
      params.value
    )
    return decoded
  }

  it('method requiring storage fee', async () => {
    const typedValueInParsed = parseUnits('5', WMAS.decimals).toString()
    const decoded = await decode(WMAS, USDC, typedValueInParsed)
    expect(decoded.amountIn).toStrictEqual(BigInt(typedValueInParsed))
  })
  it('method not requiring storage fee', async () => {
    const typedValueInParsed = parseUnits('5', USDC.decimals).toString()
    const decoded = await decode(USDC, WMAS, typedValueInParsed)

    expect(decoded.amountIn).toStrictEqual(BigInt(typedValueInParsed))
  })
})
describe('decodeLiquidityTx', async () => {
  const CHAIN_ID = ChainId.MAINNET
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const pair = new PairV2(WMAS, USDC)

  const baseOptions: BaseLiquidityParameters = {
    token0: WMAS.address,
    token1: USDC.address,
    amount0Min: 0n,
    amount1Min: 0n,
    binStep: 25,
    deadline: 0,
    to: ''
  }

  it('works for deposit', async () => {
    const options: AddLiquidityParameters = {
      ...baseOptions,
      activeIdDesired: 2 ** 17,
      amount0: 1111111n,
      amount1: 2222222n,
      distributionX: [],
      distributionY: [],
      deltaIds: [1],
      idSlippage: 0
    }
    const params = pair.liquidityCallParameters(options)
    const decoded = decodeLiquidityTx(
      params.methodName,
      params.args.serialize(),
      CHAIN_ID
    )
    expect(decoded.binStep).toStrictEqual(options.binStep)
    invariant('distributionX' in decoded)
    expect(decoded.deltaIds).toStrictEqual(options.deltaIds)
  })
  it('works for withdrawal', async () => {
    const options: RemoveLiquidityParameters = {
      ...baseOptions,
      ids: [1, 2, 3],
      amounts: [1n, 2n, 3n]
    }
    const params = pair.liquidityCallParameters(options)
    const decoded = decodeLiquidityTx(
      params.methodName,
      params.args.serialize(),
      CHAIN_ID
    )
    expect(decoded.binStep).toStrictEqual(options.binStep)
  })
})
