import {
  ChainId,
  IRouter,
  V2_LB_ROUTER_ADDRESS,
  PairV2,
  WMAS as _WMAS,
  DUSA as _DUSA,
  USDC as _USDC,
  WETH as _WETH,
  ILBPair,
  Percent,
  LB_ROUTER_ADDRESS
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account } from '@massalabs/massa-web3'

export const removeLiquidityBatch = async () => {
  console.log('\n------- removeLiquidityBatch() called -------\n')

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  const address = account.address.toString()
  if (!address) throw new Error('Missing address in account')
  const isBuildnet = false
  const client = createClient(account, isBuildnet)
  const CHAIN_ID = isBuildnet ? ChainId.BUILDNET : ChainId.MAINNET

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const DUSA = _DUSA[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]

  const router = V2_LB_ROUTER_ADDRESS[CHAIN_ID]

  // set amount slippage tolerance
  const allowedAmountSlippage = 50 // in bips, 0.5% in this case

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  // const binSteps = await

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const pairAddress = await pair
    .fetchV2Pair(binStep, client, CHAIN_ID)
    .then((r) => r.LBPair)
  const pairContract = new ILBPair(pairAddress, client)
  console.log('pairAddress', pairAddress)
  const lbPairData = await pairContract.getReservesAndId()
  const tokens = await pairContract.getTokens()
  const activeBinId = lbPairData.activeId

  const userPositionIds = await pairContract.getUserBinIds(address)
  console.log('userPositionIds', address, userPositionIds.length)

  const approved = await pairContract.isApprovedForAll(address, router)
  if (!approved) {
    const txApprove = await pairContract.setApprovalForAll(router, true)
    console.log('txIdApprove', txApprove.id)
  }

  // Split bins into chunks of 10
  const CHUNK_SIZE = 10
  const chunks = []
  for (let i = 0; i < userPositionIds.length; i += CHUNK_SIZE) {
    chunks.push(userPositionIds.slice(i, i + CHUNK_SIZE))
  }
  console.log(
    `Splitting ${userPositionIds.length} bins into ${chunks.length} chunks of max ${CHUNK_SIZE} bins each`
  )

  // Process each chunk
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunkIds = chunks[chunkIndex]
    console.log(
      `\nProcessing chunk ${chunkIndex + 1}/${chunks.length} with ${
        chunkIds.length
      } bins`
    )

    // Get bins and balances for this chunk
    const bins = await pairContract.getBins(chunkIds)

    const addresses = Array(chunkIds.length).fill(address)
    const chunkBalances = await pairContract.balanceOfBatch(addresses, chunkIds)

    // Filter out zero amounts
    const nonZeroIndices = chunkBalances
      .map((amount, index) => (amount !== 0n ? index : -1))
      .filter((index) => index !== -1)

    if (nonZeroIndices.length === 0) {
      console.log(
        `Chunk ${chunkIndex + 1}: No liquidity to remove, skipping...`
      )
      continue
    }

    const nonZeroIds = nonZeroIndices.map((i) => chunkIds[i])
    const nonZeroAmounts = nonZeroIndices.map((i) => chunkBalances[i])
    const nonZeroBins = nonZeroIndices.map((i) => bins[i])

    console.log(
      `Chunk ${chunkIndex + 1}: Found ${
        nonZeroAmounts.length
      } bins with liquidity`
    )

    // Get total supplies for non-zero bins
    const totalSupplies = await pairContract.getSupplies(nonZeroIds)

    // Calculate amounts to remove
    const removeLiquidityInput = pair.calculateAmountsToRemove(
      nonZeroIds,
      activeBinId,
      nonZeroBins,
      totalSupplies,
      nonZeroAmounts.map(String),
      new Percent(BigInt(allowedAmountSlippage), 10_000n)
    )

    const params = pair.liquidityCallParameters({
      ...removeLiquidityInput,
      amount0Min: removeLiquidityInput.amountXMin,
      amount1Min: removeLiquidityInput.amountYMin,
      ids: nonZeroIds,
      amounts: nonZeroAmounts,
      token0: tokens[0],
      token1: tokens[1],
      binStep,
      to: address,
      deadline
    })

    // Execute transaction for this chunk
    const tx = await new IRouter(router, client).remove(params)
    console.log(`Chunk ${chunkIndex + 1}: Transaction sent with ID: ${tx.id}`)

    // Wait 1s
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\n✅ All chunks processed successfully!')
}
