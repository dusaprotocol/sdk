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
    IPumpPair
  } from '@dusalabs/sdk'
  import {
    WalletClient,
    MassaUnits,
    EOperationStatus
  } from '@massalabs/massa-web3'
  import { createClient } from './utils'
  
  export const migratePool = async (pairPump = '') => {
    // Init constants
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
    const account = await WalletClient.getAccountFromSecretKey(privateKey)
    if (!account.address) throw new Error('Missing address in account')
    const client = await createClient(account)
  
    const CHAIN_ID = ChainId.BUILDNET
    const WMAS = _WMAS[CHAIN_ID]
    const pumpDeployer = _DEPLOYER[CHAIN_ID]
    const router = LB_ROUTER_ADDRESS[CHAIN_ID]
  
    const tokenAddress = await new IPumpPair(pairPump, client).getTokens()[0]
    const token = new Token(CHAIN_ID, tokenAddress, 18)
    const txIdMigrate = pumpDeployer.migratePool(pairPump)
  
    const balanceWmas = await new IERC20(WMAS, client).balanceOf(account.address)
    const balanceWmasWithoutFee = (balanceWmas * 93n) / 100n
    const wmasAmount = new TokenAmount(WMAS, balanceWmasWithoutFee)
    const tokenAmount = new TokenAmount(
      token,
      parseUnits('200_000_000', token.decimals)
    )
  
    // set amount slippage tolerance
    const allowedAmountSlippage = 50 // in bips, 0.5% in this case
  
    // set price slippage tolerance
    const allowedPriceSlippage = 0 // in bips, 0% in this case
  
    // set deadline for the transaction
    const currentTimeInMs = new Date().getTime()
    const deadline = currentTimeInMs + 3_600_000
  
    const pair = new PairV2(Token, WMAS)
    const binStep = 100
    const activeId = 8385906 // 1 token = 0.002107 MAS
  
    // await transaction confirmation before proceeding
    const status = await client
      .smartContracts()
      .awaitRequiredOperationStatus(txIdMigrate, EOperationStatus.FINAL_SUCCESS)
    if (status !== EOperationStatus.FINAL_SUCCESS)
      throw new Error('Something went wrong')
  
    // create Pair
    const txIdPair = router.createPair(
      tokenAddress,
      WMAS.address,
      activeId,
      binStep,
      20n * MassaUnits.oneMassa
    )
  
    // await transaction confirmation before proceeding
    const statusPair = await client
      .smartContracts()
      .awaitRequiredOperationStatus(txIdPair, EOperationStatus.FINAL_SUCCESS)
    if (statusPair !== EOperationStatus.FINAL_SUCCESS)
      throw new Error('Something went wrong')
  
    const lbPair = await pair.fetchLBPair(binStep, client, CHAIN_ID)
  
    // increase allowance for the router
    const approveTxId1 = await new IERC20(token.address, client).approve(
      router,
      tokenAmount.raw
    )
    const approveTxId2 = await new IERC20(WMAS.address, client).approve(
      router,
      wmasAmount.raw
    )
  
    const amountWmasPerBatch = (70n * wmasAmount.raw) / 215n
    const amountTokenPerBatch = (70n * tokenAmount.raw) / 485n
  
    const wmasAmount1 = new TokenAmount(WMAS, 0)
    const tokenAmount1 = new TokenAmount(token, amountTokenPerBatch)
  
    const amountWmasBatchActif = (5n * wmasAmount.raw) / 215n
    const amountTokenBatchActif = (65n * tokenAmount.raw) / 485n
  
    const wmasAmount2 = new TokenAmount(WMAS, amountWmasBatchActif)
    const tokenAmount2 = new TokenAmount(token, amountTokenBatchActif)
  
    const wmasAmount3 = new TokenAmount(WMAS, amountWmasPerBatch)
    const tokenAmount3 = new TokenAmount(token, 0)
  
    let addLiquidityInput = await pair.addLiquidityParameters(
      lbPair.LBPair,
      binStep,
      tokenAmount1,
      wmasAmount1,
      new Percent(BigInt(allowedAmountSlippage), 10_000n),
      new Percent(BigInt(allowedPriceSlippage), 10_000n),
      LiquidityDistribution.SPOT,
      client
    )
  
    const params1 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430,
        431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445,
        446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460,
        461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475,
        476, 477, 478, 479, 480, 481, 482, 483, 484, 485
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId1 = await new IRouter(router, client).add(params1)
    console.log('txId', txId1)
  
    const params2 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360,
        361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375,
        376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390,
        391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405,
        406, 407, 408, 409, 410, 411, 412, 413, 414, 415
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId2 = await new IRouter(router, client).add(params2)
    console.log('txId', txId2)
  
    const params3 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290,
        291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305,
        306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320,
        321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335,
        336, 337, 338, 339, 340, 341, 342, 343, 344, 345
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId3 = await new IRouter(router, client).add(params3)
    console.log('txId', txId3)
  
    const params4 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220,
        221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235,
        236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250,
        251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265,
        266, 267, 268, 269, 270, 271, 272, 273, 274, 275
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId4 = await new IRouter(router, client).add(params4)
    console.log('txId', txId4)
  
    const params5 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
        151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165,
        166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180,
        181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195,
        196, 197, 198, 199, 200, 201, 202, 203, 204, 205
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId5 = await new IRouter(router, client).add(params5)
    console.log('txId', txId5)
  
    const params6 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
        84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
        102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116,
        117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
        132, 133, 134, 135
      ],
      distributionX: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId6 = await new IRouter(router, client).add(params6)
    console.log('txId', txId6)
  
    addLiquidityInput = await pair.addLiquidityParameters(
      lbPair.LBPair,
      binStep,
      tokenAmount2,
      wmasAmount2,
      new Percent(BigInt(allowedAmountSlippage), 10_000n),
      new Percent(BigInt(allowedPriceSlippage), 10_000n),
      LiquidityDistribution.SPOT,
      client
    )
  
    const params7 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
        35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
        53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65
      ],
      distributionX: [
        0, 0, 0, 0, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515, 0.0151515,
        0.0151515
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.2, 0.2, 0.2, 0.2
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId7 = await new IRouter(router, client).add(params7)
    console.log('txId', txId7)
  
    addLiquidityInput = await pair.addLiquidityParameters(
      lbPair.LBPair,
      binStep,
      tokenAmount3,
      wmasAmount3,
      new Percent(BigInt(allowedAmountSlippage), 10_000n),
      new Percent(BigInt(allowedPriceSlippage), 10_000n),
      LiquidityDistribution.SPOT,
      client
    )
  
    const params8 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        -74, -73, -72, -71, -70, -69, -68, -67, -66, -65, -64, -63, -62, -61, -60,
        -59, -58, -57, -56, -55, -54, -53, -52, -51, -50, -49, -48, -47, -46, -45,
        -44, -43, -42, -41, -40, -39, -38, -37, -36, -35, -34, -33, -32, -31, -30,
        -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15,
        -14, -13, -12, -11, -10, -9, -8, -7, -6, -5
      ],
      distributionX: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId8 = await new IRouter(router, client).add(params8)
    console.log('txId', txId8)
  
    const params9 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        -144, -143, -142, -141, -140, -139, -138, -137, -136, -135, -134, -133,
        -132, -131, -130, -129, -128, -127, -126, -125, -124, -123, -122, -121,
        -120, -119, -118, -117, -116, -115, -114, -113, -112, -111, -110, -109,
        -108, -107, -106, -105, -104, -103, -102, -101, -100, -99, -98, -97, -96,
        -95, -94, -93, -92, -91, -90, -89, -88, -87, -86, -85, -84, -83, -82, -81,
        -80, -79, -78, -77, -76, -75
      ],
      distributionX: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId9 = await new IRouter(router, client).add(params9)
    console.log('txId', txId9)
  
    const params10 = pair.liquidityCallParameters({
      ...addLiquidityInput,
      deltaIds: [
        -214, -213, -212, -211, -210, -209, -208, -207, -206, -205, -204, -203,
        -202, -201, -200, -199, -198, -197, -196, -195, -194, -193, -192, -191,
        -190, -189, -188, -187, -186, -185, -184, -183, -182, -181, -180, -179,
        -178, -177, -176, -175, -174, -173, -172, -171, -170, -169, -168, -167,
        -166, -165, -164, -163, -162, -161, -160, -159, -158, -157, -156, -155,
        -154, -153, -152, -151, -150, -149, -148, -147, -146, -145
      ],
      distributionX: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ].map((el) => parseEther(el.toString())),
      distributionY: [
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857, 0.0142857,
        0.0142857, 0.0142857, 0.0142857, 0.0142857
      ].map((el) => parseEther(el.toString())),
      activeIdDesired: activeId,
      to: account.address,
      deadline
    })
  
    // add liquidity
    const txId10 = await new IRouter(router, client).add(params10)
    console.log('txId', txId10)
  }
  