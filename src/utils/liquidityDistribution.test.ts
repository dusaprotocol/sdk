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

  const sumDistributionX = params.distributionX.reduce((a, b) => a + b, 0n)
  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    0n,
    0n,
    0n,
    0n,
    0n,
    90909090909090909n,
    181818181818181818n,
    181818181818181818n,
    181818181818181818n,
    181818181818181818n,
    181818181818181818n
  ])
  expect(params.distributionY).toEqual([
    181818181818181818n,
    181818181818181818n,
    181818181818181818n,
    181818181818181818n,
    181818181818181818n,
    90909090909090909n,
    0n,
    0n,
    0n,
    0n,
    0n
  ])
  expect(sumDistributionX).toEqual(10n ** 18n - 1n)
  expect(sumDistributionY).toEqual(10n ** 18n - 1n)
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

  const sumDistributionX = params.distributionX.reduce((a, b) => a + b, 0n)
  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    0n,
    0n,
    0n,
    0n,
    0n,
    24390243902439024n,
    97560975609756097n,
    146341463414634146n,
    195121951219512195n,
    243902439024390243n,
    292682926829268292n
  ])
  expect(params.distributionY).toEqual([
    292682926829268292n,
    243902439024390243n,
    195121951219512195n,
    146341463414634146n,
    97560975609756097n,
    24390243902439024n,
    0n,
    0n,
    0n,
    0n,
    0n
  ])
  expect(sumDistributionX).toBeLessThan(10n ** 18n - 1n)
  expect(sumDistributionY).toBeLessThan(10n ** 18n - 1n)
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

  const sumDistributionX = params.distributionX.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    47619047619047619n,
    95238095238095238n,
    142857142857142857n,
    190476190476190476n,
    238095238095238095n,
    285714285714285714n
  ])
  expect(params.distributionY).toEqual([0n, 0n, 0n, 0n, 0n, 0n])
  expect(sumDistributionX).toEqual(10n ** 18n - 1n)
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

  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0])
  expect(params.distributionX).toEqual([0n, 0n, 0n, 0n, 0n, 0n])
  expect(params.distributionY).toEqual([
    285714285714285714n,
    238095238095238095n,
    190476190476190476n,
    142857142857142857n,
    95238095238095238n,
    47619047619047619n
  ])
  expect(sumDistributionY).toEqual(10n ** 18n - 1n)
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

  const sumDistributionX = params.distributionX.reduce((a, b) => a + b, 0n)
  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    0n,
    0n,
    0n,
    0n,
    0n,
    174249760212214784n,
    317835340137416041n,
    241102761580016849n,
    152125558193368601n,
    79836627834540759n,
    34849952042442963n
  ])
  expect(params.distributionY).toEqual([
    34849952042442963n,
    79836627834540759n,
    152125558193368601n,
    241102761580016849n,
    317835340137416041n,
    174249760212214784n,
    0n,
    0n,
    0n,
    0n,
    0n
  ])
  expect(sumDistributionX).toBeLessThan(10n ** 18n - 1n)
  expect(sumDistributionY).toBeLessThan(10n ** 18n - 1n)
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

  const sumDistributionX = params.distributionX.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([0, 1, 2, 3, 4, 5])
  expect(params.distributionX).toEqual([
    296784834225937962n,
    270670985770502227n,
    205324940016546276n,
    129551278908395012n,
    67989477656024718n,
    29678483422593802n
  ])
  expect(params.distributionY).toEqual([0n, 0n, 0n, 0n, 0n, 0n])
  expect(sumDistributionX).toBeLessThan(10n ** 18n - 1n)
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

  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  expect(params.deltaIds).toEqual([-5, -4, -3, -2, -1, 0])
  expect(params.distributionX).toEqual([0n, 0n, 0n, 0n, 0n, 0n])
  expect(params.distributionY).toEqual([
    29678483422593802n,
    67989477656024718n,
    129551278908395012n,
    205324940016546276n,
    270670985770502227n,
    296784834225937962n
  ])
  expect(sumDistributionY).toBeLessThan(10n ** 18n - 1n)
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

  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  const expectedDeltaIds = Array.from(Array(46).keys()).map((i) => i - 50)
  expect(params.deltaIds).toEqual(expectedDeltaIds)
  expect(sumDistributionY).toBeLessThan(10n ** 18n - 1n)
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

  const sumDistributionY = params.distributionY.reduce((a, b) => a + b, 0n)

  const expectedDeltaIds = Array.from(Array(46).keys()).map((i) => i + 5)
  expect(params.deltaIds).toEqual(expectedDeltaIds)
  expect(sumDistributionY).toBeLessThan(10n ** 18n - 1n)
})
