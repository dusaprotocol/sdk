// import {Bin} from './bin'
import { ChainId } from '../constants'
import { PairV2 } from './pair'
import { Token } from '../v1entities'
import { WMAS as _WMAS } from '../v1entities'
import {
  ClientFactory,
  ProviderType,
  DefaultProviderUrls
} from '@massalabs/massa-web3'
import { describe, it, expect } from 'vitest'

describe('PairV2 entity', async () => {
  const BUILDNET_URL = DefaultProviderUrls.BUILDNET
  const CHAIN_ID = ChainId.BUILDNET
  const client = await ClientFactory.createCustomClient(
    [
      { url: BUILDNET_URL, type: ProviderType.PUBLIC },
      { url: BUILDNET_URL, type: ProviderType.PRIVATE }
    ],
    true
  )

  // init tokens
  const USDC = new Token(
    ChainId.BUILDNET,
    'AS127XuJBNCJrQafhVy8cWPfxSb4PV7GFueYgAEYCEPJy3ePjMNb8',
    9,
    'USDC',
    'USD Coin'
  )
  const WETH = new Token(
    ChainId.BUILDNET,
    'AS12WuZMkAEeDGczFtHYDSnwJvmXwrUWtWo4GgKYUaR2zWv3X6RHG',
    9,
    'WETH',
    'Wrapped Ether'
  )
  const MAS = _WMAS[ChainId.BUILDNET]

  // init pairs
  const pair1 = new PairV2(USDC, MAS)
  const pair2 = new PairV2(MAS, USDC)
  const pair3 = new PairV2(USDC, WETH)

  it('can be initialized in any order of tokens', async () => {
    expect(pair1.equals(pair2)).toEqual(true)
  })

  it('can fetch all available LBPairs', async () => {
    const LBPairs = await pair1.fetchAvailableLBPairs(client, CHAIN_ID)
    expect(LBPairs.length).toBeGreaterThan(0)
  })

  it('can fetch single LBPair given the bin step', async () => {
    const binStep = 20
    const LBPair = await pair1.fetchLBPair(binStep, client, CHAIN_ID)
    expect(LBPair.binStep).toEqual(binStep)
    expect(LBPair.LBPair).not.toBeUndefined()
  })

  describe('PairV2.equals()', () => {
    it('returns true for equal pairs', () => {
      expect(pair1.equals(pair2)).toEqual(true)
    })
    it('returns false for different pairs', () => {
      expect(pair3.equals(pair2)).toEqual(false)
    })
  })

  describe('PairV2.createAllTokenPairs() / PairV2.initPairs()', () => {
    it('creates all possible combination of token pairs', () => {
      const TOKEN1 = new Token(
        ChainId.BUILDNET,
        '0x0000000000000000000000000000000000000001',
        6,
        'TOKEN1',
        'TOKEN1'
      )
      const TOKEN2 = new Token(
        ChainId.BUILDNET,
        '0x0000000000000000000000000000000000000002',
        6,
        'TOKEN2',
        'TOKEN2'
      )
      const BASES = [TOKEN1, TOKEN2]

      const allTokenPairs = PairV2.createAllTokenPairs(USDC, MAS, BASES)
      expect(allTokenPairs.length).toEqual(7)

      const allUniquePairs = PairV2.initPairs(allTokenPairs)
      expect(allUniquePairs.length).toEqual(6)
    })
  })

  describe('PairV2.getLBPairReservesAndId()', () => {
    it('can fetch LBPair reserves and activeId', async () => {
      const binStep = 20
      const LBPair = await pair1.fetchLBPair(binStep, client, CHAIN_ID)

      const lbPairData = await PairV2.getLBPairReservesAndId(
        LBPair.LBPair,
        client
      )

      expect(lbPairData.activeId).not.toBeUndefined()
      expect(lbPairData.reserveX).not.toBeUndefined()
      expect(lbPairData.reserveY).not.toBeUndefined()
    })
  })

  describe('PairV2.calculateAmounts()', () => {
    it('can accurately amounts when activeBin is included', async () => {
      const liquidity = ['13333333', '13600300', '13903508']
      const binIds = [8376297, 8376298, 8376299]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '0',
          reserveY: '420588469'
        },
        {
          reserveX: '16644559640250455745',
          reserveY: '75236144'
        },
        {
          reserveX: '20272546666666666600',
          reserveY: '0'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['420588467', '421669945', '422789291'].map((el) =>
        BigInt(el)
      )

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('1203510695082363975')
      expect(amountY.toString()).toBe('15759956')
    })
    it('can accurately calculate amounts when bin < activeBin', async () => {
      const liquidity = ['13333333']
      const binIds = [8376297]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '0',
          reserveY: '420588469'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['420588467'].map((el) => BigInt(el))

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('0')
      expect(amountY.toString()).toBe('13333333')
    })
    it('can accurately calculate amounts when bin > activeBin', async () => {
      const liquidity = ['13903508']
      const binIds = [8376299]
      const activeBin = 8376298
      const binsReserves = [
        {
          reserveX: '20272546666666666600',
          reserveY: '0'
        }
      ].map((el) => ({
        reserveX: BigInt(el.reserveX),
        reserveY: BigInt(el.reserveY)
      }))
      const totalSupplies = ['422789291'].map((el) => BigInt(el))

      const { amountX, amountY } = PairV2.calculateAmounts(
        binIds,
        activeBin,
        binsReserves,
        totalSupplies,
        liquidity
      )

      expect(amountX.toString()).toBe('666666636928543519')
      expect(amountY.toString()).toBe('0')
    })
  })
})
