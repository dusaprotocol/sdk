import {
  PairV2,
  Percent,
  RouteV2,
  Token,
  TokenAmount,
  TradeV2,
  parseUnits,
  WMAS as _WMAS
} from '../../src'
import JSBI from 'jsbi'
import { ChainId, LB_ROUTER_ADDRESS } from '../../src/constants'
import {
  ClientFactory,
  EOperationStatus,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'

export const swapAmountIn = async () => {
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const BUILDNET_URL = 'https://buildnet.massa.net/api/v2'
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')

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
    'AS1r1GapqdNx5qMDR2KybLtRWup4xFvtyRzacJXCa3hSJkb6PtSR',
    9,
    'USDC',
    'USD Coin'
  )
  const WETH = new Token(
    ChainId.BUILDNET,
    'AS1qFJRAbdPHUjVqgECNQ9dHeF6y8WfSVMPSTHk1QVtpsHppDNES',
    9,
    'WETH',
    'Wrapped Ether'
  )
  const BASES = [WMAS, USDC, WETH]

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
  const chainId = ChainId.BUILDNET
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

  // execute trade
  const params = bestTrade.swapCallParameters({
    ttl: 1000 * 60 * 10, // 10 minutes
    recipient: account.address,
    allowedSlippage: new Percent('5')
  })
  const txId = await client.smartContracts().callSmartContract({
    targetAddress: LB_ROUTER_ADDRESS[chainId],
    functionName: params.methodName,
    coins: BigInt(params.value),
    parameter: params.args,
    fee: BigInt(100_000_000),
    maxGas: BigInt(100_000_000)
  })
  console.log('txId', txId)

  // await tx confirmation and log events
  const status = await client
    .smartContracts()
    .awaitRequiredOperationStatus(txId, EOperationStatus.FINAL)
  console.log('status', status)
  await client
    .smartContracts()
    .getFilteredScOutputEvents({
      emitter_address: null,
      start: null,
      end: null,
      original_caller_address: null,
      is_final: null,
      original_operation_id: txId
    })
    .then((r) => r.forEach((e) => console.log(e.data)))
}
