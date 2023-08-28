import { ChainId } from './internal'

/**
 * DEX v2 SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1FjTt2MkpXuxKwpEh8Ar2hfy7QfkdBii5sB61UjfGnajuMwvvF',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1WvZWkdcRsa1irmgAB2zY92pnCgSvKKrnwActcv595jc4EN71b',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.DUSANET]: '',
  [ChainId.BUILDNET]: 'AS1tv8CFU6criWXZyFoJxawb6EuntYKRezqB2ahMQUCou9Kb76rS',
  [ChainId.MAINNET]: ''
}
