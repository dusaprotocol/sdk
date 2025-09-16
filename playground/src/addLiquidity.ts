import {
  ChainId,
  IERC20,
  IRouter,
  V2_LB_ROUTER_ADDRESS,
  LiquidityDistribution,
  PairV2,
  TokenAmount,
  WMAS as _WMAS,
  USDC as _USDC,
  parseUnits,
  Percent,
  ILBPair
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account } from '@massalabs/massa-web3'

export const addLiquidity = async () => {
  console.log('\n------- addLiquidity() called -------\n')

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = createClient(account)
  const CHAIN_ID = ChainId.BUILDNET

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const router = V2_LB_ROUTER_ADDRESS[CHAIN_ID]

  // set the amounts for each of tokens
  const typedValueUSDC = '20'
  const typedValueWMAS = '20'

  // wrap into TokenAmount
  const tokenAmountUSDC = new TokenAmount(
    USDC,
    parseUnits(typedValueUSDC, USDC.decimals)
  )
  const tokenAmountWMAS = new TokenAmount(
    WMAS,
    parseUnits(typedValueWMAS, WMAS.decimals)
  )

  // increase allowance for the router
  const approveTxId1 = await new IERC20(USDC.address, client).approve(
    router,
    tokenAmountUSDC.raw
  )
  const approveTxId2 = await new IERC20(WMAS.address, client).approve(
    router,
    tokenAmountWMAS.raw
  )
  if (approveTxId1) await approveTxId1.waitSpeculativeExecution()
  if (approveTxId2) await approveTxId2.waitSpeculativeExecution()

  // set amount slippage tolerance
  const allowedAmountSlippage = 50 // in bips, 0.5% in this case

  // set price slippage tolerance
  const allowedPriceSlippage = 50 // in bips, 0.5% in this case

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const lbPair = await pair.fetchV2Pair(binStep, client, CHAIN_ID)
  const lbPairData = await new ILBPair(lbPair.LBPair, client).getReservesAndId()

  // declare liquidity parameters
  const addLiquidityInput = await pair.addLiquidityParameters(
    lbPair.LBPair,
    binStep,
    tokenAmountUSDC,
    tokenAmountWMAS,
    new Percent(BigInt(allowedAmountSlippage), 10_000n),
    new Percent(BigInt(allowedPriceSlippage), 10_000n),
    LiquidityDistribution.SPOT,
    client
  )

  const params = pair.liquidityCallParameters({
    ...addLiquidityInput,
    activeIdDesired: lbPairData.activeId,
    to: account.address.toString(),
    deadline
  })

  // call methods
  const tx = await new IRouter(router, client).add(params)
  console.log('txId', tx.id)

  // await tx confirmation and log events
  await tx.waitSpeculativeExecution()
  logEvents(client, tx.id)
}
