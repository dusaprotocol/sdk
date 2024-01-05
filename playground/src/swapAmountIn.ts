import {
  ChainId,
  IERC20,
  IRouter,
  LB_ROUTER_ADDRESS,
  PairV2,
  Percent,
  RouteV2,
  TokenAmount,
  TradeV2,
  WBTC as _WBTC,
  USDC as _USDC,
  WETH as _WETH,
  WMAS as _WMAS,
  parseUnits,
  QuoterHelper
} from '@dusalabs/sdk'
import {
  Args,
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'
import { awaitFinalization, logEvents } from './utils'

export const swapAmountIn = async (executeSwap = false) => {
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
    BUILDNET_CHAIN_ID,
    true,
    account
  )

  const CHAIN_ID = ChainId.BUILDNET
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = WMAS
  const typedValueIn = '20' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 20000000
  const amountIn = new TokenAmount(inputToken, typedValueInParsed) // wrap into TokenAmount

  const bestTrade = await QuoterHelper.findBestPath(
    inputToken,
    false,
    outputToken,
    true,
    amountIn,
    true,
    3,
    client,
    CHAIN_ID
  )

  if (!bestTrade || !executeSwap) return

  // increase allowance
  const txIdAllowance = await new IERC20(inputToken.address, client).approve(
    LB_ROUTER_ADDRESS[CHAIN_ID],
    bestTrade.inputAmount.raw
  )

  if (txIdAllowance) {
    console.log('txIdAllowance', txIdAllowance)
    await awaitFinalization(client, txIdAllowance)
    logEvents(client, txIdAllowance)
  }

  // execute trade
  const params = bestTrade.swapCallParameters({
    ttl: 1000 * 60 * 10, // 10 minutes
    recipient: account.address,
    allowedSlippage: new Percent(1n, 100n)
  })
  const txId = await new IRouter(LB_ROUTER_ADDRESS[CHAIN_ID], client).swap(
    params
  )
  console.log('txId', txId)

  // await tx confirmation and log events
  await awaitFinalization(client, txId)
  logEvents(client, txId)
}
