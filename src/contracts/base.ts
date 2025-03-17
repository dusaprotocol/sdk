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
import { parseUnits } from '../lib/ethers'

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
    public shouldEstimateCoins = true,
    public shouldEstimateGas = true,
    public fee: bigint = MassaUnits.oneMassa / 100n
  ) {}

  public async call(params: BaseCallDataWithGas): Promise<string> {
    const coinsNeeded = this.shouldEstimateCoins
      ? await this.estimateCoins(params)
      : params.coins
    const gasNeeded = this.shouldEstimateGas
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
          if (!errMsg.includes(coinErrorKeyword)) {
            if (!errMsg.includes(insufficientBalanceKeyword)) return 0n

            const dec = decodeInsufficientBalance(errMsg)
            if (dec.address !== this.address) return 0n
          }
          const needed = errMsg.split(coinErrorKeyword)[1].split(',')[0]
          return BigInt(needed)
        } catch {
          return 0n
        }
      })
  }
}

export const coins = MassaUnits.oneMassa / 100n // storage cost

const insufficientBalanceKeyword = 'failed to transfer'
export const decodeInsufficientBalance = (errMsg: string) => {
  const address = errMsg.split('from spending address ')[1].split(' ')[0]

  const balance = errMsg
    .split('due to insufficient balance ')[1]
    .split(' ')[0]
    .split('"}')[0]
  const needed = errMsg
    .split(insufficientBalanceKeyword + ' ')[1]
    .split(' coins')[0]
    .split(' ')[0]
  const diff = Number(needed) - Number(balance)

  return { diff: parseUnits(diff.toString(), 9), address }
}
