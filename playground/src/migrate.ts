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
  ILBPair,
  IBaseContract
} from '@dusalabs/sdk'
import { createClient, logEvents } from './utils'
import { Account, Args, ArrayTypes, U256 } from '@massalabs/massa-web3'
import { console } from 'inspector'

export const migrate = async () => {
  console.log('\n------- migrate() called -------\n')

  // init consts
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await Account.fromPrivateKey(privateKey)
  if (!account.address) throw new Error('Missing address in account')
  const client = createClient(account)

  const CHAIN_ID = ChainId.BUILDNET
  const migrateAddress = 'AS12crMWQQDHgyDmLxDEajZxyEtifrBJFz31f6kmJpY3g6CS4zVdq'

  const newPool = 'AS1b9qU1nP9hKM8nyR93ptbGEhMyPWop7jHY1zYkZsm2jfowefK9'
  const oldPool = 'AS112Wdy9pM4fvLNLHQXyf7uam9waMPdG5ekr4vxCyQHPkrMMPPY'
  const ids = await new ILBPair(oldPool, client).getUserBinIds(
    account.address.toString()
  )

  // 1. approve migrate contract to spend LBPair tokens
  const approveTx = await new ILBPair(oldPool, client).setApprovalForAll(
    migrateAddress,
    true
  )
  console.log('approveTx', approveTx.id)

  // await tx confirmation and log events
  await approveTx.waitSpeculativeExecution()
  logEvents(client, approveTx.id)

  // 2. call migrate function on migrate contract
  const migrateArgs = new Args()
    .addString(newPool)
    .addString(oldPool)
    .addArray(ids.map(BigInt), ArrayTypes.U64)
    .serialize()
  const migrateContract = new IBaseContract(migrateAddress, client)
  migrateContract.shouldEstimateCoins = false
  const migrateTx = await migrateContract.call({
    targetFunction: 'migrate',
    parameter: migrateArgs
  })
  console.log('migrateTx', migrateTx.id)

  // await tx confirmation and log events
  await migrateTx.waitSpeculativeExecution()
  logEvents(client, migrateTx.id)
}
