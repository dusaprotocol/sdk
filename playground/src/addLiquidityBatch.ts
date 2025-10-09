import {
  ChainId,
  IERC20,
  IRouter,
  V2_LB_ROUTER_ADDRESS,
  LiquidityDistribution,
  PairV2,
  TokenAmount,
  WMAS as _WMAS,
  DUSA as _DUSA,
  USDC as _USDC,
  WETH as _WETH,
  parseUnits,
  Percent,
  ILBPair
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account } from '@massalabs/massa-web3'

export const addLiquidityBatch = async () => {
  console.log('\n------- addLiquidityBatch() called -------\n')

  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  const address = account.address.toString()
  if (!address) throw new Error('Missing address in account')
  const isBuildnet = true
  const isMainnet = !isBuildnet
  const client = createClient(account, isMainnet)
  const CHAIN_ID = isBuildnet ? ChainId.BUILDNET : ChainId.MAINNET

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const DUSA = _DUSA[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]

  const router = V2_LB_ROUTER_ADDRESS[CHAIN_ID]

  // Configure the pair
  const pair = new PairV2(USDC, WMAS)
  const binStep = 20

  // Fetch pair data
  const lbPairAddress = await pair
    .fetchV2Pair(binStep, client, CHAIN_ID)
    .then((r) => r.LBPair)
  const pairContract = new ILBPair(lbPairAddress, client)
  console.log('pairAddress', lbPairAddress)

  const lbPairData = await pairContract.getReservesAndId()
  const activeBinId = lbPairData.activeId
  console.log('activeBinId', activeBinId)

  // Set the total amounts to add across all bins
  const totalTypedValueUSDC = '100' // Total USDC to distribute
  const totalTypedValueWMAS = '100' // Total WMAS to distribute

  // Wrap into TokenAmount
  const totalTokenAmountUSDC = new TokenAmount(
    USDC,
    parseUnits(totalTypedValueUSDC, USDC.decimals)
  )
  const totalTokenAmountWMAS = new TokenAmount(
    WMAS,
    parseUnits(totalTypedValueWMAS, WMAS.decimals)
  )

  // Approve router to spend tokens
  console.log('Approving tokens...')
  const approveTxId1 = await new IERC20(USDC.address, client).approve(
    address,
    router,
    totalTokenAmountUSDC.raw
  )
  const approveTxId2 = await new IERC20(WMAS.address, client).approve(
    address,
    router,
    totalTokenAmountWMAS.raw
  )
  if (approveTxId1) {
    await approveTxId1.waitSpeculativeExecution()
    console.log('USDC approved:', approveTxId1.id)
  }
  if (approveTxId2) {
    await approveTxId2.waitSpeculativeExecution()
    console.log('WMAS approved:', approveTxId2.id)
  }

  // Set amount slippage tolerance
  const allowedAmountSlippage = 50 // in bips, 0.5% in this case

  // Set price slippage tolerance
  const allowedPriceSlippage = 50 // in bips, 0.5% in this case

  // Set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  // Define the number of bins to add liquidity to
  // You can customize this to add liquidity around the active bin
  const TOTAL_BINS = 1000
  const NUM_BINS_PER_SIDE = Math.floor((TOTAL_BINS - 1) / 2) // 499 bins on each side + active bin = 999 total
  const binIds: number[] = []
  for (let i = -NUM_BINS_PER_SIDE; i <= NUM_BINS_PER_SIDE; i++) {
    binIds.push(activeBinId + i)
  }

  console.log(
    `\nAdding liquidity to ${binIds.length} bins around active bin ${activeBinId}`
  )
  console.log(`Bin range: ${Math.min(...binIds)} to ${Math.max(...binIds)}`)

  // Split bins into chunks
  const CHUNK_SIZE = 10
  const chunks = []
  for (let i = 0; i < binIds.length; i += CHUNK_SIZE) {
    chunks.push(binIds.slice(i, i + CHUNK_SIZE))
  }
  console.log(
    `Splitting ${binIds.length} bins into ${chunks.length} chunks of max ${CHUNK_SIZE} bins each`
  )

  // Calculate amount per chunk
  const amountUSDCPerChunk = totalTokenAmountUSDC.raw / BigInt(chunks.length)
  const amountWMASPerChunk = totalTokenAmountWMAS.raw / BigInt(chunks.length)

  // Process each chunk
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunkBinIds = chunks[chunkIndex]
    console.log(
      `\nProcessing chunk ${chunkIndex + 1}/${chunks.length} with ${
        chunkBinIds.length
      } bins`
    )

    // Create TokenAmount for this chunk
    const chunkTokenAmountUSDC = new TokenAmount(USDC, amountUSDCPerChunk)
    const chunkTokenAmountWMAS = new TokenAmount(WMAS, amountWMASPerChunk)

    console.log(
      `Chunk ${
        chunkIndex + 1
      }: Adding ${chunkTokenAmountUSDC.toSignificant()} USDC and ${chunkTokenAmountWMAS.toSignificant()} WMAS`
    )

    // Declare liquidity parameters for this chunk
    const addLiquidityInput = await pair.addLiquidityParameters(
      lbPairAddress,
      binStep,
      chunkTokenAmountUSDC,
      chunkTokenAmountWMAS,
      new Percent(BigInt(allowedAmountSlippage), 10_000n),
      new Percent(BigInt(allowedPriceSlippage), 10_000n),
      LiquidityDistribution.SPOT, // You can change this to CURVE or UNIFORM
      client
    )

    const params = pair.liquidityCallParameters({
      ...addLiquidityInput,
      activeIdDesired: activeBinId,
      to: address,
      deadline
    })

    // Execute transaction for this chunk
    const tx = await new IRouter(router, client).add(params)
    console.log(`Chunk ${chunkIndex + 1}: Transaction sent with ID: ${tx.id}`)

    // // Wait for transaction to be included
    // await tx.waitSpeculativeExecution()
    // console.log(`Chunk ${chunkIndex + 1}: Transaction confirmed`)

    // Wait 1s between chunks
    if (chunkIndex < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log('\n✅ All chunks processed successfully!')
}
