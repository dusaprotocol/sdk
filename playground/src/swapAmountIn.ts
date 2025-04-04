import {
  ChainId,
  IERC20,
  IRouter,
  V2_LB_ROUTER_ADDRESS,
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
  QuoterHelper,
  V2_LB_QUOTER_ADDRESS,
  LB_ROUTER_ADDRESS,
  LB_QUOTER_ADDRESS
} from '@dusalabs/sdk'
import { Account } from '@massalabs/massa-web3'
import { createClient, logEvents } from './utils'

export const swapAmountIn = async (executeSwap = false) => {
  console.log('\n------- swapAmountIn() called -------\n')

  // Init constants
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = createClient(account)

  const CHAIN_ID = ChainId.BUILDNET
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const useV2 = false
  const router = useV2
    ? V2_LB_ROUTER_ADDRESS[CHAIN_ID]
    : LB_ROUTER_ADDRESS[CHAIN_ID]
  const quoter = useV2
    ? V2_LB_QUOTER_ADDRESS[CHAIN_ID]
    : LB_QUOTER_ADDRESS[CHAIN_ID]

  // Init: user inputs
  const inputToken = USDC
  const outputToken = WMAS
  const typedValueIn = '20' // user string input
  const typedValueInParsed = parseUnits(
    typedValueIn,
    inputToken.decimals
  ).toString() // returns 20000000
  const amountIn = new TokenAmount(inputToken, typedValueInParsed) // wrap into TokenAmount
  const isNativeIn = inputToken === WMAS
  const isNativeOut = outputToken === WMAS
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
    CHAIN_ID,
    quoter
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
