import {
  ChainId,
  USDC as _USDC,
  WMAS as _WMAS,
  USDT as _USDT,
  WETH as _WETH,
  WETH_B as _WETH_B,
  DAI as _DAI,
  IMulticall,
  MULTICALL_ADDRESS,
  Tx,
  TokenAmount,
  ILBPair
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account, Args, ArrayTypes, U256 } from '@massalabs/massa-web3'

export const migrate = async () => {
  console.log('\n------- migrate() called -------\n')

  // init consts
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = createClient(account)

  const CHAIN_ID = ChainId.BUILDNET
  const multicallAddress =
    'AS12mTGosStxfzoMgGrzWQqYnrkfbmF9vxeSvd21cFTGJjTbJfhz1' // MULTICALL_ADDRESS[CHAIN_ID]
  const multicall = new IMulticall(multicallAddress, client)

  const newPool = 'AS1mus5ekpxHa5KeQtwXWBZPXrFmQhtxToSkcM4ikvaK3ZWpT41p'
  const oldPool = 'AS14AxjeYA1K51wwyLexL67atzS75eTCAjUm3GDYTpMeZsarEhp3'
  const ids = await new ILBPair(oldPool, client).getUserBinIds(
    account.address.toString()
  )
  const migrateAddress = 'AS1HPqLQQYhu1kkDxPbdt6BBbEUR9xGGwwh2oi4dDtEFrD1vhW2Y'
  const approveCost = 13_800_000n
  const approve = new Tx(
    'setApprovalForAll',
    new Args().addBool(true).addString(migrateAddress).serialize(),
    oldPool,
    approveCost
  )
  const migrateCost = 1_000_000_000n
  const migrate = new Tx(
    'migrate',
    new Args()
      .addString(newPool)
      .addString(oldPool)
      .addArray(ids.map(BigInt), ArrayTypes.U64)
      .serialize(),
    migrateAddress,
    migrateCost
  )
  multicall.shouldEstimateCoins = false
  const tx = await multicall.executeMulticall(
    [approve, migrate],
    approveCost + migrateCost
  )
  console.log(tx.id)

  // await tx confirmation and log events
  await tx.waitSpeculativeExecution()
  logEvents(client, tx.id)
}
