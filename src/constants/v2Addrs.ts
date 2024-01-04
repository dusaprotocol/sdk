import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12A8px835db3xegXgLWVUzxyGr1xpwt4rzEBP1TZU4atEU3Cr8a',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1wqJc1dsBgFFghGW3Dc1MPYxA7DtzaVpYahXDFzk2E4vStZ6Bu',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1ArnVaCCEQDQzof6yofyitEUKMVWMzyGjhdKutMVwjazQe5Zvq',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1DnT2YWu7kJSwjV1PT6EnE5qvckuksAA8QsEPT31Vxt1eft7BT',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS133ddicgJfPx5zfKaPRLmQgkoWDndMjpVhGm2U1iKW1T6RSZxE',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS125znAYtVCJ2Qd5up1x7ffnDzuMEzMCYgyjJ82uc65FaeBFVPAn',
  [ChainId.MAINNET]: ''
}

export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12j1jjzomM123nn9tav5N5ZfAeUiuDszi5o16asftbvWzpmNNg7',
  [ChainId.MAINNET]: ''
}
