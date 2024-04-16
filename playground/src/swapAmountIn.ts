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
  DAI as _DAI,
  USDC as _USDC,
  WETH as _WETH,
  WMAS as _WMAS,
  parseUnits,
  QuoterHelper
} from '@dusalabs/sdk'
import { WalletClient } from '@massalabs/massa-web3'
import { awaitFinalization, createClient, logEvents } from './utils'

export const swapAmountIn = async (executeSwap = false) => {
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = await createClient(account)

  const CHAIN_ID = ChainId.BUILDNET
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]

  // Init: user inputs
  const inputToken = WMAS
  const outputToken = WETH
  const typedValueIn = '20' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 20000000
  const amountIn = new TokenAmount(inputToken, typedValueInParsed) // wrap into TokenAmount
  const isNativeIn = true
  const isNativeOut = false
  const maxHops = 3

  const bestTrade = await QuoterHelper.findBestPath(
    inputToken,
    isNativeIn,
    outputToken,
    isNativeOut,
    amountIn,
    true,
    maxHops,
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
