import {
  ChainId,
  IRouter,
  LB_ROUTER_ADDRESS,
  PairV2,
  WMAS as _WMAS,
  USDC as _USDC,
  ILBPair,
  Percent
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account } from '@massalabs/massa-web3'

export const removeLiquidity = async () => {
  console.log('\n------- removeLiquidity() called -------\n')

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  const address = account.address.toString()
  if (!address) throw new Error('Missing address in account')
  const client = createClient(account)
  const CHAIN_ID = ChainId.BUILDNET

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const router = LB_ROUTER_ADDRESS[CHAIN_ID]

  // set amount slippage tolerance
  const allowedAmountSlippage = 50 // in bips, 0.5% in this case

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const pairAddress = await pair
    .fetchLBPair(binStep, client, CHAIN_ID)
    .then((r) => r.LBPair)
  const pairContract = new ILBPair(pairAddress, client)
  const lbPairData = await pairContract.getReservesAndId()
  const tokens = await pairContract.getTokens()
  const activeBinId = lbPairData.activeId

  const approved = await pairContract.isApprovedForAll(address, router)
  if (!approved) {
    const txApprove = await pairContract.setApprovalForAll(router, true)
    console.log('txIdApprove', txApprove.id)
  }

  const userPositionIds = await pairContract.getUserBinIds(address)
  const addressArray = Array.from(
    { length: userPositionIds.length },
    () => address
  )
  const bins = await pairContract.getBins(userPositionIds)

  const allBins = await pairContract.balanceOfBatch(
    addressArray,
    userPositionIds
  )
  const nonZeroAmounts = allBins.filter((amount) => amount !== 0n)
  const totalSupplies = await pairContract.getSupplies(userPositionIds)

  const removeLiquidityInput = pair.calculateAmountsToRemove(
    userPositionIds,
    activeBinId,
    bins,
    totalSupplies,
    nonZeroAmounts.map(String),
    new Percent(BigInt(allowedAmountSlippage), 10_000n)
  )

  const params = pair.liquidityCallParameters({
    ...removeLiquidityInput,
    amount0Min: removeLiquidityInput.amountXMin,
    amount1Min: removeLiquidityInput.amountYMin,
    ids: userPositionIds,
    amounts: nonZeroAmounts,
    token0: tokens[0],
    token1: tokens[1],
    binStep,
    to: address,
    deadline
  })

  // call methods
  const tx = await new IRouter(router, client).remove(params)
  console.log('txId', tx.id)

  // await tx confirmation and log events
  await tx.waitSpeculativeExecution()
  logEvents(client, tx.id)
}
