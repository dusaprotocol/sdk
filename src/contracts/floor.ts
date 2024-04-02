import {
  Args,
  bytesToStr,
  bytesToU256,
  bytesToU32,
  strToBytes
} from '@massalabs/massa-web3'
import { IERC20 } from './token'

const TOKEN_Y = strToBytes('TOKEN_Y')
const PAIR = strToBytes('PAIR')
const BIN_STEP = strToBytes('BIN_STEP')
const FLOOR_PER_BIN = strToBytes('FLOOR_PER_BIN')
const FLOOR_ID = strToBytes('FLOOR_ID')
const ROOF_ID = strToBytes('ROOF_ID')
const REBALANCE_PAUSED = strToBytes('REBALANCE_PAUSED')

const TAX_RECIPIENT = strToBytes('TAX_RECIPIENT')
const TAX_RATE = strToBytes('TAX_RATE')

const maxGas = 100_000_000n
const fee = 0n

export class IFloorToken extends IERC20 {
  // FLOOR FUNCTIONS
  async raiseRoof(nbBins: number) {
    return this.client.smartContracts().callSmartContract({
      functionName: 'raiseRoof',
      targetAddress: this.address,
      parameter: new Args().addU32(nbBins).serialize(),
      maxGas,
      fee
    })
  }

  async reduceRoof(nbBins: number) {
    return this.client.smartContracts().callSmartContract({
      functionName: 'reduceRoof',
      targetAddress: this.address,
      parameter: new Args().addU32(nbBins).serialize(),
      maxGas,
      fee
    })
  }

  async floorId(): Promise<number> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: FLOOR_ID }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToU32(res[0].candidate_value)
      })
  }

  async roofId(): Promise<number> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: ROOF_ID }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToU32(res[0].candidate_value)
      })
  }

  async pair(): Promise<string> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: PAIR }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToStr(res[0].candidate_value)
      })
  }

  async tokenY(): Promise<string> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: TOKEN_Y }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToStr(res[0].candidate_value)
      })
  }

  async binStep(): Promise<number> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: BIN_STEP }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToU32(res[0].candidate_value)
      })
  }

  async floorPerBin(): Promise<bigint> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: FLOOR_PER_BIN }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToU256(res[0].candidate_value)
      })
  }

  async floorPrice(): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'floorPrice',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => bytesToU256(res.returnValue))
  }

  async rebalancePaused(): Promise<boolean> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: REBALANCE_PAUSED }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return !!bytesToU32(res[0].candidate_value)
      })
  }

  async tokensInPair(): Promise<{ amountFloor: bigint; amountY: bigint }> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'tokensInPair',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => {
        const args = new Args(res.returnValue)
        return {
          amountFloor: args.nextU256(),
          amountY: args.nextU256()
        }
      })
  }

  async calculateNewFloorId(): Promise<number> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'calculateNewFloorId',
        parameter: new Args().serialize(),
        maxGas
      })
      .then((res) => bytesToU32(res.returnValue))
  }

  async rebalanceFloor(): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      functionName: 'rebalanceFloor',
      targetAddress: this.address,
      parameter: new Args().serialize(),
      maxGas,
      fee
    })
  }

  async pauseRebalance(): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      functionName: 'pauseRebalance',
      targetAddress: this.address,
      parameter: new Args().serialize(),
      maxGas,
      fee
    })
  }

  async unpauseRebalance(): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      functionName: 'unpauseRebalance',
      targetAddress: this.address,
      parameter: new Args().serialize(),
      maxGas,
      fee
    })
  }

  // TRANSFER TAX FUNCTIONS

  async taxRecipient(): Promise<string> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: TAX_RECIPIENT }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToStr(res[0].candidate_value)
      })
  }

  async taxRate(): Promise<bigint> {
    return this.client
      .publicApi()
      .getDatastoreEntries([{ address: this.address, key: TAX_RATE }])
      .then((res) => {
        if (!res[0].candidate_value) throw new Error()
        return bytesToU256(res[0].candidate_value)
      })
  }

  setTaxRate(taxRate: bigint): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      functionName: 'setTaxRate',
      targetAddress: this.address,
      parameter: new Args().addU256(taxRate).serialize(),
      maxGas,
      fee
    })
  }

  setTaxRecipient(taxRecipient: string): Promise<string> {
    return this.client.smartContracts().callSmartContract({
      functionName: 'setTaxRecipient',
      targetAddress: this.address,
      parameter: new Args().addString(taxRecipient).serialize(),
      maxGas,
      fee
    })
  }
}
