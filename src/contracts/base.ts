import {
  CallSCParams,
  MAX_GAS_CALL,
  Operation,
  Provider,
  ReadSCData,
  SmartContract
} from '@massalabs/massa-web3'
import { EventDecoder } from '../utils/eventDecoder'
import { MassaUnits } from '../constants/internal'

type BaseCallData = Omit<
  CallSCParams,
  'fee' | 'maxGas' | 'target' | 'func' | 'parameter'
> & {
  targetFunction: string
  parameter: number[] | Uint8Array
}
type BaseCallDataWithGas = BaseCallData & {
  maxGas?: bigint
}

export class IBaseContract {
  constructor(
    public address: string,
    protected client: Provider,
    protected fee: bigint = MassaUnits.oneMassa / 100n
  ) {}

  public async call(
    params: BaseCallDataWithGas,
    estimateCoins = true,
    estimateGas = true
  ): Promise<Operation> {
    const coinsNeeded = estimateCoins
      ? await this.estimateCoins(params)
      : params.coins
    const gasNeeded = estimateGas
      ? await this.estimateGas({ ...params, coins: coinsNeeded })
      : params.maxGas
    return new SmartContract(this.client, this.address).call(
      params.targetFunction,
      Uint8Array.from(params.parameter),
      { coins: coinsNeeded, maxGas: gasNeeded, fee: this.fee }
    )
  }

  public async read(params: BaseCallDataWithGas): Promise<ReadSCData> {
    return new SmartContract(this.client, this.address).read(
      params.targetFunction,
      Uint8Array.from(params.parameter),
      { maxGas: params.maxGas || MAX_GAS_CALL }
    )
  }

  public async extract(keys: string[], final = false): Promise<Uint8Array[]> {
    return (this.client as any).readStorage(this.address, keys, final)
  }

  public async simulate(params: BaseCallData) {
    const caller: string = (this.client as any).address
    if (!caller) throw new Error('No caller address')

    return this.read({
      ...params,
      maxGas: MAX_GAS_CALL,
      caller
    })
  }

  public async estimateGas(params: BaseCallData) {
    return this.simulate(params)
      .then((r) => {
        if (r.info.gasCost === 0) return MAX_GAS_CALL
        // 10% extra gas for safety
        return BigInt(
          Math.floor(Math.min(r.info.gasCost * 1.1, Number(MAX_GAS_CALL)))
        )
      }) // 10% extra gas for safety
      .catch(() => MAX_GAS_CALL)
  }

  public async estimateCoins(params: BaseCallData) {
    return this.simulate({ ...params, coins: 0n })
      .then((r) => {
        if (r.info.error) throw new Error(r.info.error)
        return 0n
      })
      .catch((err: Error) => {
        try {
          const errMsg = EventDecoder.decodeError(err.message)
          const coinErrorKeyword = 'Storage__NotEnoughCoinsSent:'
          const [needed] = errMsg.split(coinErrorKeyword)[1].split(',')
          return BigInt(needed)
        } catch {
          return 0n
        }
      })
  }
}

export const coins = MassaUnits.oneMassa / 100n // storage cost
