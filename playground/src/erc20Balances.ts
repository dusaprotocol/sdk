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
  TokenAmount
} from '@dusalabs/sdk'
import { createClient } from './utils'
import { Account, Args, U256 } from '@massalabs/massa-web3'

export const erc20Balances = async () => {
  console.log('\n------- erc20Balances() called -------\n')

  // init consts
  const keyPair = await Account.generate()
  const client = createClient(keyPair)
  const user = 'AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar'

  const CHAIN_ID = ChainId.BUILDNET
  const USDC = _USDC[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]
  const USDT = _USDT[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const WETH_B = _WETH_B[CHAIN_ID]
  const DAI = _DAI[CHAIN_ID]
  const tokens = [USDC, WMAS, USDT, WETH, WETH_B, DAI]

  // fetch LBPairs
  const multicall = new IMulticall(MULTICALL_ADDRESS[CHAIN_ID], client)
  const data = await multicall
    .aggregateMulticall(
      tokens.map((token) => {
        return new Tx(
          'balanceOf',
          new Args().addString(user).serialize(),
          token.address
        )
      })
    )
    .then((res) => {
      const bs = new Args(res.value)
      return tokens.map(() => U256.fromBytes(bs.nextUint8Array()))
    })

  data.forEach((data, i) => {
    const token = tokens[i]
    console.debug('\nToken ', token.symbol)
    console.debug('balance: ', new TokenAmount(token, data).toSignificant(4))
  })
}
