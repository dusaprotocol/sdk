import { Client, MassaUnits } from '@massalabs/massa-web3'

export class IBaseContract {
  constructor(public address: string, protected client: Client) {}
}

export const maxGas = 100_000_000n
export const fee = MassaUnits.oneMassa / 100n // 0.01 MAS
