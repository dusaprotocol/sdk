import {
  Bin,
  ChainId,
  PairV2,
  USDC as _USDC,
  WMAS as _WMAS
} from '@dusalabs/sdk'
import {
  BUILDNET_CHAIN_ID,
  ClientFactory,
  DefaultProviderUrls,
  ProviderType
} from '@massalabs/massa-web3'

export const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    BUILDNET_CHAIN_ID,
    true
  )

  const CHAIN_ID = ChainId.BUILDNET
  const USDC = _USDC[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]

  // fetch LBPairs
  const pair = new PairV2(USDC, WMAS)
  const LBPairs = await pair.fetchAvailableLBPairs(client, CHAIN_ID)

  // fetch reserves and activeIds for each LBPair
  const requests = LBPairs.map((lbPair) =>
    PairV2.getLBPairReservesAndId(lbPair.LBPair, client)
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
