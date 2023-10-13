import { BigintIsh } from './../../constants'

export const parseEther = (ether: string): bigint => parseUnits(ether, 18)
export const parseUnits = (units: string, decimals: number): bigint =>
  BigInt(Math.round(parseFloat(units) * 10 ** decimals))

export function parseBigintIsh(bigintIsh: BigintIsh): bigint {
  return typeof bigintIsh === 'bigint' ? bigintIsh : BigInt(bigintIsh)
}
