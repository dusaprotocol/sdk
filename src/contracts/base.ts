import {
  CallSCParams,
  MAX_GAS_CALL,
  Operation,
  Provider,
  ReadSCData,
  ReadSCParams,
  SmartContract
} from '@massalabs/massa-web3'
import { EventDecoder } from '../utils/eventDecoder'
import { MassaUnits } from '../constants/internal'
import { parseUnits } from '../lib/ethers'
import { validateAddress } from '../utils'

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

type BaseReadData = Omit<
  ReadSCParams,
  'fee' | 'maxGas' | 'target' | 'func' | 'parameter'
> & {
  targetFunction: string
  parameter: number[] | Uint8Array
}
type BaseReadDataWithGas = BaseReadData & {
  maxGas?: bigint
}

export class IBaseContract {
  constructor(
    public address: string,
    protected client: Provider,
    public shouldEstimateCoins = true,
    public shouldEstimateGas = true,
    public finalStorage = false,
    public fee: bigint = MassaUnits.oneMassa / 100n
  ) {
    if (!validateAddress(address)) {
      throw new Error(`Invalid contract address: ${address}`)
    }
  }

  public async call(params: BaseCallDataWithGas): Promise<Operation> {
    // The estimate cannot see every storage cost (see estimateCoins): never send
    // fewer coins than the caller computed.
    const coinsNeeded = this.shouldEstimateCoins
      ? bigIntMax(await this.estimateCoins(params), params.coins ?? 0n)
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

  public async read(params: BaseReadDataWithGas): Promise<ReadSCData> {
    return new SmartContract(this.client, this.address)
      .read(params.targetFunction, Uint8Array.from(params.parameter), {
        maxGas: params.maxGas || MAX_GAS_CALL,
        caller: params.caller
      })
      .then((res) => {
        if (res.info.error) throw new Error(res.info.error)
        return res
      })
  }

  public async extract(keys: string[]): Promise<Uint8Array[]> {
    return this.client
      .readStorage(this.address, keys, this.finalStorage)
      .then((res) => res.map((r) => new Uint8Array(r || [])))
  }

  public async simulate(params: BaseReadDataWithGas, caller: string) {
    return this.read({
      ...params,
      maxGas: MAX_GAS_CALL,
      caller
    })
  }

  public async estimateGas(params: BaseReadDataWithGas) {
    return this.simulate(params, (this.client as any).address)
      .then((r) => {
        if (r.info.gasCost === 0) return MAX_GAS_CALL
        const gasCost = r.info.gasCost * 1.1 // 10% extra gas for safety
        return BigInt(Math.floor(Math.min(gasCost, Number(MAX_GAS_CALL))))
      })
      .catch(() => MAX_GAS_CALL)
  }

  /**
   * Estimates the coins a call needs for storage by simulating it without coins and
   * parsing `Storage__NotEnoughCoinsSent:<amount>` from the error.
   *
   * Contracts that reconcile coins with `transferRemaining`, such as MRC20 0.1.0 tokens
   * (WMAS once MIP-0002 is active), revert with `SPENT_MORE_COINS_THAN_SENT` instead,
   * which gives no amount: the estimate is then 0, and the caller has to pass the
   * storage cost in `coins` (see IERC20).
   */
  public async estimateCoins(params: BaseReadDataWithGas) {
    return this.simulate({ ...params, coins: 0n }, (this.client as any).address)
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

const bigIntMax = (a: bigint, b: bigint): bigint => (a > b ? a : b)

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
