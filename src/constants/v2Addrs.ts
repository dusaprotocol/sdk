import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12nWoALo3rrJGPH8xdG86SpLd8ZjfxbBrJS5C2xHAqXD4e5BTEb',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1Ju6JjgnUbovcGbdi5ENupH89fyfvMsjSQdgRywWb1xtgxyDAb',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1PH6wmbxPYUpktBDF5T6qgfLkYfeR86biw9TDmy1bijePgMGa8',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1ZuGZSq2w2tHFiTddqTohQMkKUsPZzdRVkyRBAygSGGRcTw7ww',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12ZYLR7AFYC5TduoniL4u4x5QEFqzv6pwTqg8Tfq7PxCBppmJHu',
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
