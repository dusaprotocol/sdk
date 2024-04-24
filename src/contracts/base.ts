import {
  Client,
  ICallData,
  IContractReadOperationResponse,
  IReadData,
  MassaUnits,
  strToBytes
} from '@massalabs/massa-web3'

export class IBaseContract {
  protected fee: Promise<bigint>

  constructor(public address: string, protected client: Client) {
    this.fee = client
      .publicApi()
      .getMinimalFees()
      .catch(() => Promise.resolve(MassaUnits.mMassa))
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

  protected async extract(keys: string[]): Promise<(Uint8Array | null)[]> {
    return this.client
      .publicApi()
      .getDatastoreEntries(
        keys.map((key) => ({ address: this.address, key: strToBytes(key) }))
      )
      .then((res) => res.map((r) => r.candidate_value))
  }
}

export const maxGas = 100_000_000n
export const coins = MassaUnits.oneMassa / 100n // storage cost
