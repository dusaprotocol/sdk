import { Args } from '@massalabs/massa-web3'
import { IBaseContract } from './base'

export class IPumpDeployer extends IBaseContract {
  async deploy(
    name: string,
    symbol: string,
    amountForFee: bigint,
    amountForBuy = 0n
  ): Promise<string> {
    return this.call({
      targetFunction: 'deploy',
      coins: amountForFee + amountForBuy,
      parameter: new Args()
        .addString(name)
        .addString(symbol)
        .addU256(amountForBuy)
    })
  }

  async migratePool(pair: string): Promise<string> {
    return this.call({
      targetFunction: 'migratePool',
      parameter: new Args().addString(pair)
    })
  }
}
