import {
  Args,
  CallSCParams,
  MAX_GAS_CALL,
  //   ReadSCParams,
  Provider
} from '@massalabs/massa-web3'
import { EventDecoder } from '../utils/eventDecoder'
import { MassaUnits } from '../constants/internal'

// type BaseParams = Omit<ReadSCParams, 'func' | 'target' | 'parameter'> & {
//   targetFunction: string
//   targetAddress: string
//   parameter: number[] | Uint8Array
// }
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
  ) {
    const coinsNeeded = estimateCoins
      ? await this.estimateCoins(params)
      : params.coins
    const gasNeeded = estimateGas
      ? await this.estimateGas({ ...params, coins: coinsNeeded })
      : params.maxGas
    return this.client.callSC({
      target: this.address,
      func: params.targetFunction,
      parameter: new Args(Uint8Array.from(params.parameter)),
      maxGas: gasNeeded,
      coins: coinsNeeded,
      fee: this.fee
    })
  }

  public async read(params: BaseCallDataWithGas) {
    return this.client.readSC({
      ...params,
      target: this.address,
      func: params.targetFunction,
      maxGas: params.maxGas || MAX_GAS_CALL,
      parameter: new Args(Uint8Array.from(params.parameter))
    })
  }

  public async extract(
    keys: string[],
    final = false
  ): Promise<(Uint8Array | null)[]> {
    return this.client
      .readStorage(this.address, keys, final)
      .then((res) => res.map((r) => r))
  }

  public async simulate(params: BaseCallData) {
    const caller = this.client.address
    if (!caller) throw new Error('No caller address')

    return this.read({
      ...params,
      maxGas: MAX_GAS_CALL,
      caller
    })
  }

  public async estimateGas(params: BaseCallData) {
    return this.simulate(params)
      .then((r) =>
        BigInt(Math.floor(Math.min(r.info.gasCost * 1.1, Number(MAX_GAS_CALL))))
      ) // 10% extra gas for safety
      .catch(() => MAX_GAS_CALL)
  }

  public async estimateCoins(params: BaseCallData) {
    return this.simulate({ ...params, coins: 0n })
      .then(() => 0n)
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
