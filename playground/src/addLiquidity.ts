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
  getLiquidityConfig
} from '@dusalabs/sdk'
import {
  ClientFactory,
  DefaultProviderUrls,
  EOperationStatus,
  ProviderType,
  WalletClient
} from '@massalabs/massa-web3'
import { awaitFinalization, logEvents } from './utils'

export const addLiquidity = async () => {
  console.log('\n------- addLiquidity() called -------\n')

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
    true,
    account
  )
  const CHAIN_ID = ChainId.BUILDNET

  // initialize tokens
  const WMAS = _WMAS[CHAIN_ID]
  const USDC = _USDC[CHAIN_ID]

  const spender = LB_ROUTER_ADDRESS[CHAIN_ID]
  const txIdApprove0 = await new IERC20(USDC.address, client).approve(spender)
  const txIdApprove1 = await new IERC20(WMAS.address, client).approve(spender)
  await awaitFinalization(client, txIdApprove0)
  await awaitFinalization(client, txIdApprove1)

  // set the amounts for each of tokens
  const typedValueUSDC = '20'
  const typedValueWMAS = '20'

  // wrap into TokenAmount
  const tokenAmountUSDC = new TokenAmount(USDC, BigInt(typedValueUSDC))
  const tokenAmountWMAS = new TokenAmount(WMAS, BigInt(typedValueWMAS))

  // set amounts slippage tolerance
  const allowedAmountsSlippage = 50 // in bips, 0.5% in this case

  // based on the amounts slippage tolerance, get the minimum amounts
  const minTokenAmountUSDC =
    (tokenAmountUSDC.raw * BigInt(10000 - allowedAmountsSlippage)) /
    BigInt(10000)
  const minTokenAmountWMAS =
    (tokenAmountWMAS.raw * BigInt(10000 - allowedAmountsSlippage)) /
    BigInt(10000)

  // set price slippage tolerance
  const allowedPriceSlippage = 50 // in bips, 0.5% in this case
  const priceSlippage = allowedPriceSlippage / 10000 // 0.005

  // set deadline for the transaction
  const currenTimeInMs = new Date().getTime()
  const deadline = currenTimeInMs + 3_600_000

  const pair = new PairV2(USDC, WMAS)
  const binStep = 20
  const lbPair = await pair.fetchLBPair(binStep, client, CHAIN_ID)
  const lbPairData = await PairV2.getLBPairReservesAndId(lbPair.LBPair, client)
  const activeBinId = lbPairData.activeId

  // get idSlippage
  const idSlippage = Bin.getIdSlippageFromPriceSlippage(priceSlippage, binStep)

  // Example 1: getting distribution parameters for one of the default 'LiquidityDistribution' shapes
  const { deltaIds, distributionX, distributionY } = getLiquidityConfig(
    LiquidityDistribution.SPOT
  )

  // declare liquidity parameters
  const addLiquidityInput = {
    token0: USDC.address,
    token1: WMAS.address,
    binStep: binStep,
    amount0: tokenAmountUSDC.raw,
    amount1: tokenAmountWMAS.raw,
    amount0Min: minTokenAmountUSDC,
    amount1Min: minTokenAmountWMAS,
    activeIdDesired: activeBinId,
    idSlippage,
    deltaIds,
    distributionX,
    distributionY,
    to: account.address,
    deadline
  }

  // init router contract
  const router = new IRouter(LB_ROUTER_ADDRESS[CHAIN_ID], client)

  // set AVAX amount, such as tokenAmountAVAX.raw.toString(), when one of the tokens is AVAX; otherwise, set to null
  const value = null

  // call methods
  const txId = await router.addLiquidity(addLiquidityInput)
  console.log('txId', txId)

  // await tx confirmation and log events
  await awaitFinalization(client, txId)
  logEvents(client, txId)
}
