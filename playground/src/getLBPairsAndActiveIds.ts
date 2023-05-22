import { Bin, PairV2, Token } from '../../src'
import { ChainId } from '../../src/constants'
import { WMAS as _WMAS } from '../../src'

export const getLBPairsAndActiveIds = async () => {
  console.log('\n------- getLBPairsAndActiveIds() called -------\n')

  // init consts
  const DUSANET_URL = 'https://api.avax-test.network/ext/bc/C/rpc'
  const chainId = ChainId.DUSANET
  const USDC = new Token(
    ChainId.DUSANET,
    '0xB6076C93701D6a07266c31066B298AeC6dd65c2d',
    6,
    'USDC',
    'USD Coin'
  )
  const WMAS = [ChainId.DUSANET]

  // fetch LBPairs
  const pair = new PairV2(USDC, WMAS)
  const LBPairs = await pair.fetchAvailableLBPairs(provider, chainId)

  // fetch reserves and activeIds for each LBPair
  const requests = LBPairs.map((lbPair) =>
    PairV2.getLBPairReservesAndId(lbPair.LBPair, provider)
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
      Bin.getPriceFromId(data.activeId, lbPair.binStep),
      '\n'
    )
  })

  // fetch single LBPair
  const binStep = 10
  const lbPair = await pair.fetchLBPair(binStep, provider, chainId)
  console.log('lbPair', lbPair)
  const lbPairData = await PairV2.getLBPairReservesAndId(
    lbPair.LBPair,
    provider
  )
  console.debug('\nLBPair ', lbPair.LBPair)
  console.debug('reserveX: ', lbPairData.reserveX.toString())
  console.debug('reserveY: ', lbPairData.reserveY.toString())
  console.debug('activeId: ', lbPairData.activeId.toString())
  console.debug(
    'price: ',
    Bin.getPriceFromId(lbPairData.activeId, binStep),
    '\n'
  )
}
