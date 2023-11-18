import { Client } from '@massalabs/massa-web3'
import { Token, TokenAmount } from '../v1entities'
import { PairV2, RouteV2, TradeV2 } from '../v2entities'
import {
  WBTC as _WBTC,
  USDC as _USDC,
  USDT as _USDT,
  WETH as _WETH,
  WMAS as _WMAS
} from '../v1entities'
import { ChainId } from '../constants'

export class QuoterHelper {
  static async findBestPath(
    inputToken: Token,
    isNativeIn: boolean,
    outputToken: Token,
    isNativeOut: boolean,
    amount: TokenAmount,
    isExactIn: boolean,
    maxHops: number,
    baseClient: Client,
    CHAIN_ID: ChainId
  ) {
    const BASES: Token[] = [
      _WMAS[CHAIN_ID],
      _USDC[CHAIN_ID],
      _WETH[CHAIN_ID],
      _WBTC[CHAIN_ID],
      _USDT[CHAIN_ID]
    ]

    // get all [Token, Token] combinations
    const allTokenPairs = PairV2.createAllTokenPairs(
      inputToken,
      outputToken,
      BASES
    )

    // get pairs
    const allPairs = PairV2.initPairs(allTokenPairs)

    // routes to consider in finding the best trade
    const allRoutes = RouteV2.createAllRoutes(
      allPairs,
      inputToken,
      outputToken,
      maxHops
    )

    const trades = await (isExactIn
      ? TradeV2.getTradesExactIn
      : TradeV2.getTradesExactOut)(
      allRoutes,
      amount,
      isExactIn ? outputToken : inputToken,
      isNativeIn,
      isNativeOut,
      baseClient,
      CHAIN_ID
    )

    const filteredTrades = trades.filter(
      (trade): trade is TradeV2 => trade !== undefined
    )
    return TradeV2.chooseBestTrade(filteredTrades, isExactIn)
  }
}
