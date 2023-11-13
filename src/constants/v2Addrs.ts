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
  [ChainId.BUILDNET]: 'AS122qfSe7QnrZbA6oujoYgHXbdq3JcPHu5BLz4obWkqJipgniH2G',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12wEtAVFnbM2bjM54bWHzRawrgWi6Y6xhxVKfqT4xoXGi2Et2E7',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: '',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}
