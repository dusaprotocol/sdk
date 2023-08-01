import { ChainId } from './internal'

/**
 * DEX v2 SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12jpqNB3a5cz1U9xY9Yc1RSoVdFk5LdKwiTz8BmUCEtgG49AXhj',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12HLXHZFixwTZDvuYUfdaZi6Uo54Qkks3ifmiqMhrSiLdNLAaF4',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12PKQQxUtvbUmKvXaiFC1xjbAyQkABenoxLk1LrGEakjiZJcneT',
  [ChainId.MAINNET]: ''
}
