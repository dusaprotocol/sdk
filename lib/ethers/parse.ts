export const parseEther = (ether: string): BigInt => BigInt(ether)
export const parseUnits = (units: string, decimals: number): BigInt =>
  BigInt(units) / BigInt(10 ** decimals)
