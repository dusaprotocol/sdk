import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12i1UxxszrS56np9TQwig1ySGRR6CmePzGysVynXcjGAiw1HPAc',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12ZhJYEffSWWyp7XvCoEMKFBnbXw5uwp6S3cY2xbEr76W3VL3Dk',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1pLmABmGWUTBoaMPwThauUy75PQi8WW29zVYMHbU54ep1o9Hbf',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12DEdQKeA1ynJhvv4Zt9o3wgdeNENDAAtrfq61yy1ST3uBNHqET',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: '',
  [ChainId.TESTNET]: '',
  [ChainId.MAINNET]: ''
}
