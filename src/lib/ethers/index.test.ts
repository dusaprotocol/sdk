import { it, expect, describe } from 'vitest'
import { parseUnits } from '.'

describe('parseUnits', () => {
  it('should parse units', () => {
    const units = parseUnits('1.0', 18)
    expect(units).toBe(1000000000000000000n)
  })
  it('should parse units with decimals', () => {
    const units = parseUnits('1.1', 18)
    expect(units).toBe(1100000000000000000n)
  })
  it('should parse units with 0', () => {
    const units = parseUnits('0', 18)
    expect(units).toBe(0n)
  })
  it('should round correctly', () => {
    const units = parseUnits('0.027701573454366149', 18)
    expect(units).toBe(27701573454366149n)
  })
})
