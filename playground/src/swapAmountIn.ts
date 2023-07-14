import {
  PairV2,
  RouteV2,
  Token,
  TokenAmount,
  TradeV2,
  WMAS as _WMAS
} from '../../src'
import JSBI from 'jsbi'
import { ChainId } from '../../src/constants'
import { parseUnits } from '../../lib/ethers'
import {
  ClientFactory,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'

export const swapAmountIn = async () => {
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const DUSANET_URL = 'https://buildnet.massa.net/api/v2'
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  const client = await ClientFactory.createCustomClient(
    [
      { url: DUSANET_URL, type: ProviderType.PUBLIC },
      { url: DUSANET_URL, type: ProviderType.PRIVATE }
    ],
    true,
    account
  )

  const WMAS = _WMAS[ChainId.DUSANET]
  const USDC = new Token(
    ChainId.DUSANET,
    '0xB6076C93701D6a07266c31066B298AeC6dd65c2d',
    6,
    'USDC',
    'USD Coin'
  )
  const USDT = new Token(
    ChainId.DUSANET,
    '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732',
    6,
    'USDT.e',
    'Tether USD'
  )
  const BASES = [WMAS, USDC, USDT]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = WMAS
  const typedValueIn = '20' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 10000
  const amountIn = new TokenAmount(inputToken, JSBI.BigInt(typedValueInParsed)) // wrap into TokenAmount

  // get all [Token, Token] combinations
  const allTokenPairs = PairV2.createAllTokenPairs(
    inputToken,
    outputToken,
    BASES
  )

  // get pairs
  const allPairs = PairV2.initPairs(allTokenPairs) // console.log('allPairs', allPairs)

  // routes to consider in finding the best trade
  const allRoutes = RouteV2.createAllRoutes(
    allPairs,
    inputToken,
    outputToken,
    2
  ) // console.log('allRoutes', allRoutes)

  // get trades
  const chainId = ChainId.DUSANET
  const trades = await TradeV2.getTradesExactIn(
    allRoutes,
    amountIn,
    outputToken,
    false,
    false,
    client,
    chainId
  ) // console.log('trades', trades.map(el=>el.toLog()))

  for (let trade of trades) {
    if (!trade) return

    console.log('\n', trade.toLog())
    const { totalFeePct, feeAmountIn } = await trade.getTradeFee()
    console.debug('Total fees percentage', totalFeePct.toSignificant(6), '%')
    console.debug(
      `Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`
    )
  }

  const filteredTrades = trades.filter(
    (trade): trade is TradeV2 => trade !== undefined
  )
  const bestTrade = TradeV2.chooseBestTrade(filteredTrades, true)
  console.log('bestTrade', bestTrade?.toLog())

  // get gas estimates for each trade
  // const WALLET_PK = process.env.PRIVATE_KEY
  // const userSlippageTolerance = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000)) // 0.5%
  // const signer = new ethers.Wallet(WALLET_PK, provider)
  // const estimatedGasCosts = await Promise.all(
  //   trades.map((trade) => trade.estimateGas(signer, chainId, userSlippageTolerance))
  // )

  // // get best trade
  // const { bestTrade, estimatedGas } = TradeV2.chooseBestTrade(trades, estimatedGasCosts)
  // console.log('bestTrade', bestTrade.toLog())
  // console.log('swapGasCostEstimate', estimatedGas.toString())
}
