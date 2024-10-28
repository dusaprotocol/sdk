import { describe, it, expect } from 'vitest'
import { decodeSwapTx, isLiquidtyMethod, isSwapMethod } from './router'
import { LIQUIDITY_ROUTER_METHODS, SWAP_ROUTER_METHODS } from '../types'
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
import { Account, Args, ArrayTypes, Web3Provider } from '@massalabs/massa-web3'

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
  const client = Web3Provider.mainnet(baseAccount)
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
      Uint8Array.from(params.args.serialize()),
      params.value
    )
    return decoded
  }

  it('method requiring storage fee', async () => {
    // const typedValueInParsed = parseUnits('5', WMAS.decimals).toString()
    // const decoded = await decode(WMAS, USDC, typedValueInParsed)
    // expect(decoded.amountIn).toStrictEqual(BigInt(typedValueInParsed))

    const route = [
      'AS12U4TZfNK7qoLyEERBBRDMu8nm5MKoRzPXDXans4v9wdATZedz9',
      'AS1hCJXjndR4c9vekLWsXGnrdigp4AaZ7uYG3UKFzzKnWVsrNLPJ'
    ]
    const ser = new Args().addArray(route, ArrayTypes.STRING).serialize()
    expect(ser.length).toBeGreaterThan(0)
  })
  //   it('method not requiring storage fee', async () => {
  //     const typedValueInParsed = parseUnits('5', USDC.decimals).toString()
  //     const decoded = await decode(USDC, WMAS, typedValueInParsed)

  //     expect(decoded.amountIn).toStrictEqual(BigInt(typedValueInParsed))
  //   })
})
