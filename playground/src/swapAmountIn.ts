import {
  ChainId,
  IRouter,
  LB_ROUTER_ADDRESS,
  PairV2,
  Percent,
  RouteV2,
  TokenAmount,
  TradeV2,
  USDC as _USDC,
  WETH as _WETH,
  WMAS as _WMAS,
  parseUnits
} from '@dusalabs/sdk'
import {
  Args,
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'

export const swapAmountIn = async () => {
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
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

  const CHAIN_ID = ChainId.BUILDNET
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const BASES = [WMAS, USDC, WETH]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = WMAS
  const typedValueIn = '20' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 10000
  const amountIn = new TokenAmount(inputToken, typedValueInParsed) // wrap into TokenAmount

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
  const trades = await TradeV2.getTradesExactIn(
    allRoutes,
    amountIn,
    outputToken,
    false,
    false,
    client,
    CHAIN_ID
  ) // console.log('trades', trades.map(el=>el.toLog()))

  for (let trade of trades) {
    if (!trade) return

    console.log('\n', trade.toLog())
    const { totalFeePct, feeAmountIn } = trade.getTradeFee()
    console.debug('Total fees percentage', totalFeePct.toSignificant(6), '%')
    console.debug(
      `Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`
    )
  }

  const bestTrade = TradeV2.chooseBestTrade(trades, true)
  console.log('bestTrade', bestTrade?.toLog())

  // increase allowance
  const txIdAllowance = await client.smartContracts().callSmartContract({
    targetAddress: inputToken.address,
    functionName: 'increaseAllowance',
    coins: 0n,
    parameter: new Args()
      .addString(LB_ROUTER_ADDRESS[CHAIN_ID])
      .addU64(bestTrade.inputAmount.raw)
      .serialize(),
    fee: BigInt(100_000_000),
    maxGas: BigInt(100_000_000)
  })
  console.log('txIdAllowance', txIdAllowance)

  // await tx confirmation and log events
  const statusAllowance = await client
    .smartContracts()
    .awaitRequiredOperationStatus(txIdAllowance, EOperationStatus.FINAL)
  console.log('statusAllowance', statusAllowance)
  await client
    .smartContracts()
    .getFilteredScOutputEvents({
      emitter_address: null,
      start: null,
      end: null,
      original_caller_address: null,
      is_final: null,
      original_operation_id: txIdAllowance
    })
    .then((r) => r.forEach((e) => console.log(e.data)))
  // TODO: check if events contain errors

  // execute trade
  const params = bestTrade.swapCallParameters({
    ttl: 1000 * 60 * 10, // 10 minutes
    recipient: account.address,
    allowedSlippage: new Percent('5')
  })
  const router = new IRouter(LB_ROUTER_ADDRESS[CHAIN_ID], client)
  const txId = await router[params.methodName](params)
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
