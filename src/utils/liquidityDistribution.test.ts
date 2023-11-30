import { it, expect } from 'vitest'
import {
  getUniformDistributionFromBinRange,
  getBidAskDistributionFromBinRange,
  getCurveDistributionFromBinRange
} from './liquidityDistribution'
import { CurrencyAmount, TokenAmount, USDC as _USDC } from '../v1entities'
import { parseEther } from '../lib/ethers'
import { ChainId } from '../constants'

const token0 = _USDC[ChainId.BUILDNET]

it('getUniformDistributionFromBinRange', () => {
  const activeId = 8376038

  const params = getUniformDistributionFromBinRange(activeId, [
    activeId - 5,
    activeId + 5
  ])

  const sumDistributionX = params.distributionX.reduce(
    (a, b) => a + b,
    BigInt(0)
  )
  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt('90909090909090909'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818')
  ])
  expect(params.distributionY).toEqual([
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('181818181818181818'),
    BigInt('90909090909090909'),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0)
  ])
  expect(sumDistributionX).toEqual(BigInt(10) ** BigInt(18) - BigInt(1))
  expect(sumDistributionY).toEqual(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getBidAskDistributionFromBinRange with amount X and Y', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('1'))
  const amountB = new TokenAmount(token0, parseEther('0.5'))

  const params = getBidAskDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionX = params.distributionX.reduce(
    (a, b) => a + b,
    BigInt(0)
  )
  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt('24390243902439024'),
    BigInt('97560975609756097'),
    BigInt('146341463414634146'),
    BigInt('195121951219512195'),
    BigInt('243902439024390243'),
    BigInt('292682926829268292')
  ])
  expect(params.distributionY).toEqual([
    BigInt('292682926829268292'),
    BigInt('243902439024390243'),
    BigInt('195121951219512195'),
    BigInt('146341463414634146'),
    BigInt('97560975609756097'),
    BigInt('24390243902439024'),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0)
  ])
  expect(sumDistributionX).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
  expect(sumDistributionY).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getBidAskDistributionFromBinRange with amount X only', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('1'))
  const amountB = new TokenAmount(token0, parseEther('0'))

  const params = getBidAskDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionX = params.distributionX.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    BigInt('47619047619047619'),
    BigInt('95238095238095238'),
    BigInt('142857142857142857'),
    BigInt('190476190476190476'),
    BigInt('238095238095238095'),
    BigInt('285714285714285714')
  ])
  expect(params.distributionY).toEqual([
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0)
  ])
  expect(sumDistributionX).toEqual(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getBidAskDistributionFromBinRange with amount Y only', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('0'))
  const amountB = new TokenAmount(token0, parseEther('0.5'))

  const params = getBidAskDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0])
  expect(params.distributionX).toEqual([
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0)
  ])
  expect(params.distributionY).toEqual([
    BigInt('285714285714285714'),
    BigInt('238095238095238095'),
    BigInt('190476190476190476'),
    BigInt('142857142857142857'),
    BigInt('95238095238095238'),
    BigInt('47619047619047619')
  ])
  expect(sumDistributionY).toEqual(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getCurveDistributionFromBinRange with amount X and Y', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('1'))
  const amountB = new TokenAmount(token0, parseEther('0.5'))

  const params = getCurveDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionX = params.distributionX.reduce(
    (a, b) => a + b,
    BigInt(0)
  )
  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt('174249760212214784'),
    BigInt('317835340137416041'),
    BigInt('241102761580016849'),
    BigInt('152125558193368601'),
    BigInt('79836627834540759'),
    BigInt('34849952042442963')
  ])
  expect(params.distributionY).toEqual([
    BigInt('34849952042442963'),
    BigInt('79836627834540759'),
    BigInt('152125558193368601'),
    BigInt('241102761580016849'),
    BigInt('317835340137416041'),
    BigInt('174249760212214784'),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0),
    BigInt(0)
  ])
  expect(sumDistributionX).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
  expect(sumDistributionY).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getCurveDistributionFromBinRange with amount X only', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('1'))
  const amountB = new TokenAmount(token0, parseEther('0'))

  const params = getCurveDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionX = params.distributionX.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    BigInt('296784834225937962'),
    BigInt('270670985770502227'),
    BigInt('205324940016546276'),
    BigInt('129551278908395012'),
    BigInt('67989477656024718'),
    BigInt('29678483422593802')
  ])
  expect(params.distributionY).toEqual([
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0')
  ])
  expect(sumDistributionX).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getCurveDistributionFromBinRange with amount Y only', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('0'))
  const amountB = new TokenAmount(token0, parseEther('0.5'))

  const params = getCurveDistributionFromBinRange(
    activeId,
    [activeId - 5, activeId + 5],
    [amountA, amountB]
  )

  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0])
  expect(params.distributionX).toEqual([
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0'),
    BigInt('0')
  ])
  expect(params.distributionY).toEqual([
    BigInt('29678483422593802'),
    BigInt('67989477656024718'),
    BigInt('129551278908395012'),
    BigInt('205324940016546276'),
    BigInt('270670985770502227'),
    BigInt('296784834225937962')
  ])
  expect(sumDistributionY).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getCurveDistributionFromBinRange with bin range below active bin', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('0'))
  const amountB = new TokenAmount(token0, parseEther('1'))

  const params = getCurveDistributionFromBinRange(
    activeId,
    [activeId - 50, activeId - 5],
    [amountA, amountB]
  )

  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  const expectedDeltaIds = Array.from(Array(46).keys()).map((i) => i - 50)
  expect(params.deltaIds).toEqual(expectedDeltaIds)
  expect(sumDistributionY).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})

it('getCurveDistributionFromBinRange with bin range above active bin', () => {
  const activeId = 8376038
  const amountA = CurrencyAmount.ether(43113, parseEther('1'))
  const amountB = new TokenAmount(token0, parseEther('0'))

  const params = getCurveDistributionFromBinRange(
    activeId,
    [activeId + 5, activeId + 50],
    [amountA, amountB]
  )

  const sumDistributionY = params.distributionY.reduce(
    (a, b) => a + b,
    BigInt(0)
  )

  const expectedDeltaIds = Array.from(Array(46).keys()).map((i) => i + 5)
  expect(params.deltaIds).toEqual(expectedDeltaIds)
  expect(sumDistributionY).toBeLessThan(BigInt(10) ** BigInt(18) - BigInt(1))
})
