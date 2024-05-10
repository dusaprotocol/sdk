import {
  Client,
  ICallData,
  IContractReadOperationResponse,
  IReadData,
  MAX_GAS_CALL,
  MassaUnits,
  strToBytes
} from '@massalabs/massa-web3'
import { EventDecoder } from '../utils/eventDecoder'

type BaseCallData = Omit<ICallData, 'fee' | 'maxGas' | 'targetAddress'>

export class IBaseContract {
  protected fee: Promise<bigint>

  constructor(public address: string, protected client: Client) {
    this.fee = client
      .publicApi()
      .getMinimalFees()
      .catch(() => Promise.resolve(MassaUnits.mMassa))
  }

  protected async call(
    params: BaseCallData & {
      maxGas?: bigint
    },
    estimate = true
  ): Promise<string> {
    const prom = estimate && this.simulate(params)
    const coinsNeeded = prom ? await this.estimateCoins(prom) : params.coins
    const gasNeeded = prom ? await this.estimateGas(prom) : params.maxGas
    return this.client.smartContracts().callSmartContract({
      ...params,
      targetAddress: this.address,
      maxGas: gasNeeded,
      coins: coinsNeeded,
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

  private async simulate(params: BaseCallData) {
    console.log('Simulating call', params)
    const callerAddress = this.client.wallet().getBaseAccount()?.address()
    if (!callerAddress) throw new Error('No caller address')
    return this.read({
      ...params,
      maxGas: MAX_GAS_CALL,
      callerAddress
    })
  }

  protected async estimateGas(
    promise: Promise<IContractReadOperationResponse>
  ) {
    return promise.then((r) => BigInt(r.info.gas_cost))
  }

  protected async estimateCoins(
    promise: Promise<IContractReadOperationResponse>
  ) {
    return promise
      .then(() => 0n)
      .catch((err: Error) => {
        try {
          const errMsg = EventDecoder.decodeError(err.message)
          console.log({ errMsg })
          const coinErrorKeyword = 'Storage__NotEnoughCoinsSent:'
          const [needed] = errMsg.split(coinErrorKeyword)[1].split(',')
          return BigInt(needed)
        } catch {
          return 0n
        }
      })
  }
}

export const maxGas = 4_294_167_295n
export const coins = MassaUnits.oneMassa / 100n // storage cost
