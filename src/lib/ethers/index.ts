import { BigintIsh } from './../../constants'
import JSBI from 'jsbi'

export const parseEther = (ether: string): bigint => parseUnits(ether, 9)
export const parseUnits = (units: string, decimals: number): bigint =>
  BigInt(parseFloat(units) * 10 ** decimals)

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}
