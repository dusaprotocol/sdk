import {
  Bin,
  ChainId,
  IERC20,
  IRouter,
  LB_ROUTER_ADDRESS,
  LiquidityDistribution,
  PairV2,
  TokenAmount,
  WMAS as _WMAS,
  USDC as _USDC,
  getLiquidityConfig,
  ILBPair,
  Percent
} from '@dusalabs/sdk'
import {
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
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
  const lbPair = await pair.fetchLBPair(binStep, client, CHAIN_ID)
  const lbPairData = await PairV2.getLBPairReservesAndId(lbPair.LBPair, client)
  const activeBinId = lbPairData.activeId

  const x = new ILBPair(lbPair.LBPair, client)

  const approved = await x.isApprovedForAll(address, router)

  if (!approved) {
    const txIdApprove = await x.setApprovalForAll(router, true)
    console.log('txIdApprove', txIdApprove)
  }

  const range = 200 // should be enough in most cases
  const addressArray = Array.from({ length: 2 * range + 1 }, () => address)
  const binsArray: number[] = []
  for (let i = activeBinId - range; i <= activeBinId + range; i++) {
    binsArray.push(i)
  }

  const userPositionIds = await x.getUserBinIds(address)
  const bins = await x.getBins(userPositionIds)

  const allBins = await x.balanceOfBatch(
    addressArray.slice(0, userPositionIds.length),
    userPositionIds
  )
  const nonZeroAmounts = allBins.filter((amount) => amount !== 0n)
  const totalSupplies = await x.getSupplies(userPositionIds)

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
  console.log(params.args.getArgsList())

  // call methods
  const txId = await new IRouter(router, client).remove(params)
  console.log('txId', txId)

  // await tx confirmation and log events
  await awaitFinalization(client, txId)
  logEvents(client, txId)
}
