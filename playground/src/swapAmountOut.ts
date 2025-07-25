import {
  ChainId,
  IERC20,
  IRouter,
  V2_LB_ROUTER_ADDRESS,
  PairV2,
  Percent,
  QuoterHelper,
  RouteV2,
  TokenAmount,
  TradeV2,
  USDC as _USDC,
  DAI as _DAI,
  WMAS as _WMAS,
  parseUnits
} from '@dusalabs/sdk'
import { Account } from '@massalabs/massa-web3'
import { createClient, logEvents } from './utils'

export const swapAmountOut = async (executeSwap = false) => {
  console.debug('\n------- swapAmountOut() called -------\n')

  // Init constants
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = createClient(account)

  const CHAIN_ID = ChainId.BUILDNET
  const DAI = _DAI[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]
  const router = V2_LB_ROUTER_ADDRESS[CHAIN_ID]

  // Init: user inputs
  const inputToken = DAI
  const outputToken = USDC
  const typedValueOut = '1' // user string input
  const typedValueOutParsed = parseUnits(
    typedValueOut,
    outputToken.decimals
  ).toString() // returns 1000000
  const amountOut = new TokenAmount(outputToken, typedValueOutParsed) // wrap into TokenAmount
  const isNativeIn = inputToken === WMAS
  const isNativeOut = outputToken === WMAS
  const maxHops = 2

  const bestTrade = await QuoterHelper.findBestPath(
    inputToken,
    isNativeIn,
    outputToken,
    isNativeOut,
    amountOut,
    false,
    maxHops,
    client,
    CHAIN_ID
  )

  console.log('bestTrade', bestTrade.toLog())

  if (!bestTrade || !executeSwap) return

  // increase allowance
  const txAllowance = await new IERC20(inputToken.address, client).approve(
    router,
    bestTrade.inputAmount.raw
  )

  if (txAllowance) {
    console.log('txIdAllowance', txAllowance)
    await txAllowance.waitSpeculativeExecution()
    logEvents(client, txAllowance.id)
  }

  // execute trade
  const params = bestTrade.swapCallParameters({
    ttl: 1000 * 60 * 10, // 10 minutes
    recipient: account.address.toString(),
    allowedSlippage: new Percent(1n, 100n)
  })
  const tx = await new IRouter(router, client).swap(params)
  console.log('txId', tx.id)

  // await tx confirmation and log events
  await tx.waitSpeculativeExecution()
  logEvents(client, tx.id)
}
