import {
  ChainId,
  PairV2,
  RouteV2,
  Token,
  TokenAmount,
  TradeV2,
  WMAS as _WMAS,
  parseUnits
} from '@dusalabs/sdk'
import {
  ClientFactory,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'

export const swapAmountOut = async () => {
  console.debug('\n------- swapAmountOut() called -------\n')

  // Init constants
  const BUILDNET_URL = 'https://buildnet.massa.net/api/v2'
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    true,
    account
  )

  const WMAS = _WMAS[ChainId.BUILDNET]
  const USDC = new Token(
    ChainId.BUILDNET,
    'AS127XuJBNCJrQafhVy8cWPfxSb4PV7GFueYgAEYCEPJy3ePjMNb8',
    9,
    'USDC',
    'USD Coin'
  )
  const WETH = new Token(
    ChainId.BUILDNET,
    'AS12WuZMkAEeDGczFtHYDSnwJvmXwrUWtWo4GgKYUaR2zWv3X6RHG',
    9,
    'WETH',
    'Wrapped Ether'
  )
  const BASES = [WMAS, USDC, WETH]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = WMAS
  const typedValueOut = '1' // user string input
  const typedValueOutParsed = parseUnits(
    typedValueOut,
    outputToken.decimals
  ).toString() // returns 10000
  const amountOut = new TokenAmount(outputToken, BigInt(typedValueOutParsed)) // wrap into TokenAmount

  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )

  // get pairs
  const allPairs = PairV2.initPairs(allTokenPairs) // console.debug('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken) // console.debug('allRoutes', allRoutes)

  // get tradess
  const chainId = ChainId.BUILDNET
  const trades = await TradeV2.getTradesExactOut(
    allRoutes,
    amountOut,
    inputToken,
    false,
    false,
    client,
    chainId
  )

  // console.log('trades', trades)
  for (let trade of trades) {
    if (!trade) return

    console.log('\n', trade.toLog())
    const { totalFeePct, feeAmountIn } = trade.getTradeFee()
    console.debug('Total fees percentage', totalFeePct.toSignificant(6), '%')
    console.debug(
      `Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`
    ) // in token's decimals
  }

  const filteredTrades = trades.filter(
    (trade): trade is TradeV2 => trade !== undefined
  )
  const bestTrade = TradeV2.chooseBestTrade(filteredTrades, false)
  console.log('bestTrade', bestTrade.toLog())
}
