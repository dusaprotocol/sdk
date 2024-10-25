import { Args, bytesToStr, byteToBool } from '@massalabs/massa-web3'
import { IERC20 } from './token'
import { bytesToU256, bytesToU32 } from '@massalabs/web3-utils'

export class IFloorToken extends IERC20 {
  // FLOOR CALLS
  async raiseRoof(nbBins: number) {
    const parameter = new Args().addU32(BigInt(nbBins)).serialize()
    return this.call({
      targetFunction: 'raiseRoof',
      parameter
    })
  }

  async reduceRoof(nbBins: number) {
    const parameter = new Args().addU32(BigInt(nbBins)).serialize()
    return this.call({
      targetFunction: 'reduceRoof',
      parameter
    })
  }

  async rebalanceFloor() {
    return this.call({
      targetFunction: 'rebalanceFloor',
      parameter: new Args().serialize()
    })
  }

  async pauseRebalance() {
    return this.call({
      targetFunction: 'pauseRebalance',
      parameter: new Args().serialize()
    })
  }

  async unpauseRebalance() {
    return this.call({
      targetFunction: 'unpauseRebalance',
      parameter: new Args().serialize()
    })
  }

  // FLOOR GETTERS

  async floorId() {
    return this.all().then((res) => res.floorId)
  }

  async roofId() {
    return this.all().then((res) => res.roofId)
  }

  async pair() {
    return this.all().then((res) => res.pair)
  }

  async tokenY() {
    return this.all().then((res) => res.tokenY)
  }

  async binStep() {
    return this.all().then((res) => res.binStep)
  }

  async floorPerBin() {
    return this.all().then((res) => res.floorPerBin)
  }

  async floorPrice(): Promise<bigint> {
    return this.read({
      targetFunction: 'floorPrice',
      parameter: new Args().serialize()
    }).then((res) => bytesToU256(res.value))
  }

  async rebalancePaused(): Promise<boolean> {
    return this.all().then((res) => res.rebalancePaused)
  }

  async tokensInPair(): Promise<{ amountFloor: bigint; amountY: bigint }> {
    return this.read({
      targetFunction: 'tokensInPair',
      parameter: new Args().serialize()
    }).then((res) => {
      const args = new Args(res.value)
      return { amountFloor: args.nextU256(), amountY: args.nextU256() }
    })
  }

  async calculateNewFloorId(): Promise<number> {
    return this.read({
      targetFunction: 'calculateNewFloorId',
      parameter: new Args().serialize()
    }).then((res) => bytesToU32(res.value))
  }

  async all(): Promise<{
    floorId: number
    roofId: number
    pair: string
    tokenY: string
    binStep: number
    floorPerBin: bigint
    rebalancePaused: boolean
  }> {
    return this.extract([
      'FLOOR_ID',
      'ROOF_ID',
      'PAIR',
      'TOKEN_Y',
      'BIN_STEP',
      'FLOOR_PER_BIN',
      'REBALANCE_PAUSED'
    ]).then((_res) => {
      if (_res.some((r) => !r)) throw new Error()
      const res = _res as Uint8Array[]
      return {
        floorId: bytesToU32(res[0]),
        roofId: bytesToU32(res[1]),
        pair: bytesToStr(res[2]),
        tokenY: bytesToStr(res[3]),
        binStep: bytesToU32(res[4]),
        floorPerBin: bytesToU256(res[5]),
        rebalancePaused: byteToBool(res[6])
      }
    })
  }

  // TRANSFER TAX FUNCTIONS

  async taxRecipient(): Promise<string> {
    return this.extract(['TAX_RECIPIENT']).then((res) => {
      if (!res[0]?.length) throw new Error()
      return bytesToStr(res[0])
    })
  }

  async taxRate(): Promise<bigint> {
    return this.extract(['TAX_RATE']).then((res) => {
      if (!res[0]?.length) throw new Error()
      return bytesToU256(res[0])
    })
  }

  setTaxRate(taxRate: bigint) {
    return this.call({
      targetFunction: 'setTaxRate',
      parameter: new Args().addU256(taxRate).serialize()
    })
  }

  setTaxRecipient(taxRecipient: string) {
    return this.call({
      targetFunction: 'setTaxRecipient',
      parameter: new Args().addString(taxRecipient).serialize()
    })
  }
}
