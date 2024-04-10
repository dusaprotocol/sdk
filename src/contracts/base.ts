import {
  Client,
  ICallData,
  IContractReadOperationResponse,
  IReadData,
  MassaUnits
} from '@massalabs/massa-web3'

export class IBaseContract {
  fee: Promise<bigint>

  constructor(public address: string, protected client: Client) {
    this.fee = client.publicApi().getMinimalFees()
  }

  protected async call(
    params: Omit<ICallData, 'fee' | 'maxGas' | 'targetAddress'> & {
      maxGas?: bigint
    }
  ): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      ...params,
      targetAddress: this.address,
      maxGas,
      fee: await this.fee
    })
  }

  protected async read(
    params: Omit<IReadData, 'maxGas' | 'targetAddress'> & {
      maxGas?: bigint
    }
  ): Promise<IContractReadOperationResponse> {
    return this.client.smartContracts().readSmartContract({
      ...params,
      targetAddress: this.address,
      maxGas
    })
  }
}

export const maxGas = 100_000_000n
export const coins = MassaUnits.oneMassa / 100n // storage cost
