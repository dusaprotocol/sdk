import JSBI from 'jsbi'
import { BigintIsh } from '../../src/constants'

export const parseEther = (ether: string): BigInt => BigInt(ether)
export const parseUnits = (units: string, decimals: number): BigInt =>
  BigInt(units) / BigInt(10 ** decimals)

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}
