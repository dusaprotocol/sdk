import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1NfGCE7xcHzJg8Rk2PDJ9uHZdeWeBH9mtT94CDvE2MYiYJY4Kn',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1YqRd4gDMaJ1Udkd1TsMFXEhAbaRoQvMURPgHYs9w8zc1egrNQ',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS121XwJiQhqTGt7TDxx1e4wcj2wgDTqnVcxLav9p3BJ9NCt12pUE',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1BH7uHz6J2e7d9HWKqnNf3Kku5y53W3o8xJmynFb51A19haztQ',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1SNV5EkCwRgzDMjxCX7HkiMXu97AJprpNnUL7dWebcYdbWqnYH',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1fQLtwB5o3SMMKAdaTArBAiUhkzPk76Cbjgb9yWGD7JAuLLLex',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12j1jjzomM123nn9tav5N5ZfAeUiuDszi5o16asftbvWzpmNNg7',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}
