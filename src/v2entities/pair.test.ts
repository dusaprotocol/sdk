// import {Bin} from './bin'
import { ChainId } from '../constants'
import { PairV2 } from './pair'
import { Token, USDC as _USDC, WETH as _WETH } from '../v1entities'
import { WMAS as _WMAS } from '../v1entities'
import { describe, it, expect } from 'vitest'
import { Account, JsonRpcProvider } from '@massalabs/massa-web3'

describe('PairV2 entity', async () => {
  const CHAIN_ID = ChainId.MAINNET
  const baseAccount = await Account.generate()
  const client = JsonRpcProvider.mainnet(baseAccount)

  // init tokens
  const USDC = _USDC[CHAIN_ID]
  const WETH = _WETH[CHAIN_ID]
  const WMAS = _WMAS[CHAIN_ID]

  // init pairs
  const pair1 = new PairV2(USDC, WMAS)
  const pair2 = new PairV2(WMAS, USDC)
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
        CHAIN_ID,
        '0x0000000000000000000000000000000000000001',
        6,
        'TOKEN1',
        'TOKEN1'
      )
      const TOKEN2 = new Token(
        CHAIN_ID,
        '0x0000000000000000000000000000000000000002',
        6,
        'TOKEN2',
        'TOKEN2'
      )
      const BASES = [TOKEN1, TOKEN2]

      const allTokenPairs = PairV2.createAllTokenPairs(USDC, WMAS, BASES)
      expect(allTokenPairs.length).toEqual(7)

      const allUniquePairs = PairV2.initPairs(allTokenPairs)
      expect(allUniquePairs.length).toEqual(6)
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
