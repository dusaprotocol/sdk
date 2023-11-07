import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12gJvKxC9uwB8tsKCuitwmxCGAdLhbCLBog7BqGXSc1cMqKc5k6',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS121Wvu7PUb1D7Pq2SAEvAHbsNoCbb1EcwcTLHP7dJFmnXxgddeg',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12atWA6N8kUAZhSfkoB9KfjP8g4UU6SweUxpUvc9p4Yjys2DswE',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12k3VGgsvEGxRE4K8DAtVZPnVhFDFb5pass6gRBQHbcrLiJGQbG',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12TL7jxo1PmUA4pWtohuGLvVF9SrDAUm2ksz6n3ZcgxfuwSUAQF',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: '',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}
