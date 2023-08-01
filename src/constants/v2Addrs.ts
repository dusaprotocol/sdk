import { ChainId } from './internal'

/**
 * DEX v2 SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS12MTcKENa9eD22984GRGZg8zSH4pi5aApMA36fzU4j9ZzC3BuxC',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS135wTPuB4rNVn97Gv5og4bZHUD54b21QDiCyaS5to1R9Zj2mAy',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1Vo2Xceh6fjGyjJKn46KC3iqEM5x9waUBFhMNCGQq5FEWCKBWu',
  [ChainId.MAINNET]: ''
}
