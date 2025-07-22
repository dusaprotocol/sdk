import {
  Bin,
  ChainId,
  ILBPair,
  LBPairInformation,
  LBPairReservesAndId,
  PairV2,
  USDC as _USDC,
  WMAS as _WMAS
} from '@dusalabs/sdk'
import { createClient } from './utils'
import { Account } from '@massalabs/massa-web3'

export const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const CHAIN_ID = ChainId.MAINNET
  const USDC = _USDC[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]

  const keyPair = await Account.generate()
  const client = createClient(keyPair, CHAIN_ID === ChainId.MAINNET)

  // fetch LBPairs
  const pair = new PairV2(USDC, WMAS)
  const LBPairs = await pair.fetchAvailableLBPairs(client, CHAIN_ID)

  // fetch reserves and activeIds for each LBPair
  const requests = LBPairs.map(async (lbPair) => [
    await new ILBPair(lbPair.LBPair, client).getReservesAndId(),
    await new ILBPair(lbPair.LBPair, client).getTokens()
  ])
  const data = await Promise.all(requests)
  data.forEach((data, i) => {
    const lbPair = LBPairs[i]
    const { reserveX, reserveY, activeId } = data[0] as LBPairReservesAndId
    const [token0, token1] = data[1] as [string, string]
    const decimals0 = token0 === USDC.address ? USDC.decimals : WMAS.decimals
    const decimals1 = token1 === USDC.address ? USDC.decimals : WMAS.decimals
    console.debug('\nLBPair ', lbPair.LBPair)
    console.debug('BinStep ', lbPair.binStep.toString())
    console.debug('reserveX: ', reserveX.toString())
    console.debug('reserveY: ', reserveY.toString())
    console.debug('activeId: ', activeId.toString())
    console.debug(
      'price: ',
      Bin.getPriceFromId(Number(activeId), Number(lbPair.binStep)) *
        10 ** (decimals0 - decimals1),
      '\n'
    )
  })
}
