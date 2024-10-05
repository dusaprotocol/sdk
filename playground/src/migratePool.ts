import {
    ChainId,
    IERC20,
    IRouter,
    LB_ROUTER_ADDRESS,
    PairV2,
    Percent,
    LiquidityDistribution,
    TokenAmount,
    parseEther,
    Token,
    WMAS as _WMAS,
    PUMP_DEPLOYER as _DEPLOYER,
    parseUnits,
    IPumpPair,
  } from '@dusalabs/sdk'
  import { WalletClient, MassaUnits, EOperationStatus } from '@massalabs/massa-web3'
  import { createClient } from './utils'
  
  export const migratePool = async (pairPump = "") => {
    // Init constants
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
    const account = await WalletClient.getAccountFromSecretKey(privateKey)
    if (!account.address) throw new Error('Missing address in account')
    const client = await createClient(account)

    const CHAIN_ID = ChainId.BUILDNET;
    const WMAS = _WMAS[CHAIN_ID];
    const pumpDeployer = _DEPLOYER[CHAIN_ID];
    const router = LB_ROUTER_ADDRESS[CHAIN_ID];

    const tokenAddress = await new IPumpPair(pairPump, client).getTokens()[0];
    const token = new Token(CHAIN_ID, tokenAddress, 18);
    const txIdMigrate = pumpDeployer.migratePool(pairPump);

    const balanceWmas = await new IERC20(WMAS, client).balanceOf(account.address);
    const wmasAmount =  new TokenAmount(WMAS, balanceWmas);
    const tokenAmount = new TokenAmount(WMAS, parseUnits("200_000_000", token.decimals));

    
    // set amount slippage tolerance
    const allowedAmountSlippage = 50 // in bips, 0.5% in this case

    // set price slippage tolerance
    const allowedPriceSlippage = 0; // in bips, 0% in this case

    // set deadline for the transaction
    const currentTimeInMs = new Date().getTime();
    const deadline = currentTimeInMs + 3_600_000;

    const pair = new PairV2(Token, WMAS);
    const binStep = 100;
    const activeId = 8385906; // 1 token = 0.002107 MAS
    
    // await transaction confirmation before proceeding
    const status = await client.smartContracts().awaitRequiredOperationStatus(txIdMigrate, EOperationStatus.FINAL_SUCCESS);
    if (status !== EOperationStatus.FINAL_SUCCESS) throw new Error("Something went wrong");

    // create Pair
    const txIdPair = router.createPair(tokenAddress, WMAS.address, activeId, binStep, 20n * MassaUnits.oneMassa);

    // await transaction confirmation before proceeding
    const statusPair = await client.smartContracts().awaitRequiredOperationStatus(txIdPair, EOperationStatus.FINAL_SUCCESS);
    if (statusPair !== EOperationStatus.FINAL_SUCCESS) throw new Error("Something went wrong");

    const lbPair = await pair.fetchLBPair(binStep, client, CHAIN_ID);

    // increase allowance for the router
    const approveTxId1 = await new IERC20(token.address, client).approve(router, tokenAmount.raw);
    const approveTxId2 = await new IERC20(WMAS.address, client).approve(router, wmasAmount.raw);

    const addLiquidityInput = await pair.addLiquidityParameters(
        lbPair.LBPair,
        binStep,
        tokenAmount,
        wmasAmount,
        new Percent(BigInt(allowedAmountSlippage), 10_000n),
        new Percent(BigInt(allowedPriceSlippage), 10_000n),
        LiquidityDistribution.SPOT,
        client
    );
    
    const params1 = pair.liquidityCallParameters({
        ...addLiquidityInput,
        deltaIds: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
        distributionX: [
          0, 0, 0, 0, 0, 0.090909, 0.181818, 0.181818, 0.181818, 0.181818, 0.181818
        ].map((el) => parseEther(el.toString())),
        distributionY: [
          0.181818, 0.181818, 0.181818, 0.181818, 0.181818, 0.090909, 0, 0, 0, 0, 0
        ].map((el) => parseEther(el.toString())),
        activeIdDesired: activeId,
        to: account.address,
        deadline,
    });

    // add liquidity
    const txId1 = await new IRouter(router, client).add(params1);
    console.log("txId", txId1);
}
  