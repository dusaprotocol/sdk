import { Provider } from '@massalabs/massa-web3'
import { PairV2, RouteV2, TradeV2 } from '../v2entities'
import { Token, TokenAmount, USDC, WMAS, WETH } from '../v1entities'
import { ChainId, LB_QUOTER_ADDRESS } from '../constants'

export class QuoterHelper {
  static async findBestPath(
    inputToken: Token,
    isNativeIn: boolean,
    outputToken: Token,
    isNativeOut: boolean,
    amount: TokenAmount,
    isExactIn: boolean,
    maxHops: number,
    baseClient: Provider,
    CHAIN_ID: ChainId,
    quoterAddress = LB_QUOTER_ADDRESS[CHAIN_ID]
  ) {
    const BASES: Token[] = [WMAS, USDC, WETH].map((token) => token[CHAIN_ID])

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
      CHAIN_ID,
      quoterAddress
    )

    const filteredTrades = trades.filter(
      (trade): trade is TradeV2 => trade !== undefined
    )
    return TradeV2.chooseBestTrade(filteredTrades, isExactIn)
  }
}
