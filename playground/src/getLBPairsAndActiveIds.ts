import {
  Bin,
  ChainId,
  ILBPair,
  PairV2,
  USDC as _USDC,
  WMAS as _WMAS
} from '@dusalabs/sdk'
import { createClient } from './utils'
import { Account } from '@massalabs/massa-web3'

export const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const keyPair = await Account.generate()
  const client = createClient(keyPair)

  const CHAIN_ID = ChainId.BUILDNET
  const USDC = _USDC[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]

  // fetch LBPairs
  const pair = new PairV2(USDC, WMAS)
  const LBPairs = await pair.fetchAvailableLBPairs(client, CHAIN_ID)

  // fetch reserves and activeIds for each LBPair
  const requests = LBPairs.map(
    async (lbPair) =>
      await new ILBPair(lbPair.LBPair, client).getReservesAndId()
  )
  const data = await Promise.all(requests)
  data.forEach((data, i) => {
    const lbPair = LBPairs[i]
    console.debug('\nLBPair ', lbPair.LBPair)
    console.debug('BinStep ', lbPair.binStep.toString())
    console.debug('reserveX: ', data.reserveX.toString())
    console.debug('reserveY: ', data.reserveY.toString())
    console.debug('activeId: ', data.activeId.toString())
    console.debug(
      'price: ',
      Bin.getPriceFromId(Number(data.activeId), Number(lbPair.binStep)),
      '\n'
    )
  })
}
