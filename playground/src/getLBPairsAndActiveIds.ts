import { Bin, ChainId, PairV2, Token, WMAS as _WMAS } from '@dusalabs/sdk'
import {
  WalletClient,
  ClientFactory,
  ProviderType
} from '@massalabs/massa-web3'

export const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const BUILDNET_URL = 'https://buildnet.massa.net/api/v2'
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
  const account = await WalletClient.getAccountFromSecretKey(privateKey)
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    true,
    account
  )

  const chainId = ChainId.BUILDNET
  const USDC = new Token(
    ChainId.BUILDNET,
    'AS127XuJBNCJrQafhVy8cWPfxSb4PV7GFueYgAEYCEPJy3ePjMNb8',
    9,
    'USDC',
    'USD Coin'
  )
  const WMAS = _WMAS[ChainId.BUILDNET]

  // fetch LBPairs
  const pair = new PairV2(USDC, WMAS)
  const LBPairs = await pair.fetchAvailableLBPairs(client, chainId)

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

  // fetch single LBPair
  const binStep = 20
  const lbPair = await pair.fetchLBPair(binStep, client, chainId)
  console.log('lbPair', lbPair)
  const lbPairData = await PairV2.getLBPairReservesAndId(lbPair.LBPair, client)
  console.debug('\nLBPair ', lbPair.LBPair)
  console.debug('reserveX: ', lbPairData.reserveX.toString())
  console.debug('reserveY: ', lbPairData.reserveY.toString())
  console.debug('activeId: ', lbPairData.activeId.toString())
  console.debug(
    'price: ',
    Bin.getPriceFromId(Number(lbPairData.activeId), binStep),
    '\n'
  )
}
