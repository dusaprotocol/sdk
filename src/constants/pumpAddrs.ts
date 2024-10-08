import { ChainId } from './internal'

/**
 * Pump SDK
 */
export const PUMP_DEPLOYER: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12dX5yPVxo6TdFJ7xbBZaUDVK7w9dn978q6f88YJqu6ZunudfAy',
  [ChainId.MAINNET]: ''
}

export const PUMP_FACTORY: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12nDtHk5DVDGiSPVyoMUgTm1xQw27qCQ2d1u6aGFPjJgvA1A9We',
  [ChainId.MAINNET]: ''
}
