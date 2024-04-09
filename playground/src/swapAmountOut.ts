import {
  ChainId,
  IERC20,
  IRouter,
  LB_ROUTER_ADDRESS,
  PairV2,
  Percent,
  QuoterHelper,
  RouteV2,
  TokenAmount,
  TradeV2,
  USDC as _USDC,
  DAI as _DAI,
  parseUnits
} from '@dusalabs/sdk'
import {
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'
import { awaitFinalization, logEvents } from './utils'

export const swapAmountOut = async (executeSwap = false) => {
  console.debug('\n------- swapAmountOut() called -------\n')

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
  const DAI = _DAI[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  // Init: user inputs
  const inputToken = DAI
  const outputToken = USDC
  const typedValueOut = '1' // user string input
  const typedValueOutParsed = parseUnits(
    typedValueOut,
    outputToken.decimals
  ).toString() // returns 1000000
  const amountOut = new TokenAmount(outputToken, typedValueOutParsed) // wrap into TokenAmount

  const bestTrade = await QuoterHelper.findBestPath(
    inputToken,
    false,
    outputToken,
    false,
    amountOut,
    false,
    3,
    client,
    CHAIN_ID
  )

  console.log('bestTrade', bestTrade.toLog())

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
