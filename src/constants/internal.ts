export enum ChainId {
  BUILDNET,
  MAINNET
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP
}

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256'
}

export const MassaUnits = {
  oneMassa: BigInt(10 ** 9),
  mMassa: BigInt(10 ** 6),
  uMassa: BigInt(10 ** 3)
}
