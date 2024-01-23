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
import {
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'
import { awaitFinalization, logEvents } from './utils'

export const removeLiquidity = async () => {
  console.log('\n------- removeLiquidity() called -------\n')

  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  const address = account.address
  if (!address) throw new Error('Missing address in account')
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

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const router = LB_ROUTER_ADDRESS[CHAIN_ID]

  // set amount slipage tolerance
  const allowedAmountSlippage = 50 // in bips, 0.5% in this case

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const pairAddress = await pair
    .fetchLBPair(binStep, client, CHAIN_ID)
    .then((r) => r.LBPair)
  const lbPairData = await new ILBPair(pairAddress, client).getReservesAndId()
  const activeBinId = lbPairData.activeId

  const pairContract = new ILBPair(pairAddress, client)
  const approved = await pairContract.isApprovedForAll(address, router)
  if (!approved) {
    const txIdApprove = await pairContract.setApprovalForAll(router, true)
    console.log('txIdApprove', txIdApprove)
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
    new Percent(BigInt(allowedAmountSlippage))
  )

  const params = pair.liquidityCallParameters({
    ...removeLiquidityInput,
    amount0Min: removeLiquidityInput.amountXMin,
    amount1Min: removeLiquidityInput.amountYMin,
    ids: userPositionIds,
    amounts: nonZeroAmounts,
    token0: USDC.address,
    token1: WMAS.address,
    binStep,
    to: address,
    deadline
  })

  // call methods
  const txId = await new IRouter(router, client).remove(params)
  console.log('txId', txId)

  // await tx confirmation and log events
  await awaitFinalization(client, txId)
  logEvents(client, txId)
}
