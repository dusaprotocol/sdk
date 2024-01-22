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
  ILBPair
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

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const router = LB_ROUTER_ADDRESS[CHAIN_ID]
  const txIdApprove0 = await new IERC20(USDC.address, client).approve(router)
  const txIdApprove1 = await new IERC20(WMAS.address, client).approve(router)
  await awaitFinalization(client, txIdApprove0)
  await awaitFinalization(client, txIdApprove1)

  // set the amounts for each of tokens
  const typedValueUSDC = '20'
  const typedValueWMAS = '20'

  // wrap into TokenAmount
  const tokenAmountUSDC = new TokenAmount(USDC, BigInt(typedValueUSDC))
  const tokenAmountWMAS = new TokenAmount(WMAS, BigInt(typedValueWMAS))

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const lbPair = await pair.fetchLBPair(binStep, client, CHAIN_ID)
  const lbPairData = await PairV2.getLBPairReservesAndId(lbPair.LBPair, client)
  const activeBinId = lbPairData.activeId

  const x = new ILBPair(lbPair.LBPair, client)

  const approved = await x.isApprovedForAll(account.address, router)

  if (!approved) {
    const hashApproval = await x.setApprovalForAll(router, true)
    console.log(`Approving transaction sent with hash ${hashApproval}`)
  }

  // declare liquidity parameters
  const removeLiquidityInput = {
    token0: USDC.address,
    token1: WMAS.address,
    binStep: binStep,
    amount0Min: 0, // TODO
    amount1Min: 0, // TODO
    ids: [],
    amounts: [],
    to: account.address,
    deadline
  }

  // set MAS amount, such as tokenAmountMAS.raw.toString(), when one of the tokens is MAS; otherwise, set to null
  const value = null

  // call methods
  const txId = await new IRouter(LB_ROUTER_ADDRESS[CHAIN_ID], client).add(
    removeLiquidityInput
  )
  console.log('txId', txId)

  // await tx confirmation and log events
  await awaitFinalization(client, txId)
  logEvents(client, txId)
}
