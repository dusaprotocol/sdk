import { BigintIsh } from './../../constants'

export const parseEther = (ether: string): bigint => parseUnits(ether, 9)
export const parseUnits = (units: string, decimals: number): bigint =>
  BigInt(parseFloat(units) * 10 ** decimals)

export function parseBigintIsh(bigintIsh: BigintIsh): bigint {
  return typeof bigintIsh === 'bigint'
    ? BigInt(bigintIsh.toString())
    : BigInt(bigintIsh)
}
