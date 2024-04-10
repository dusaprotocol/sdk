import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12JQSdhJRvAMeeWxJHiX5Rd51yMtsdcxTddzaM7qLXunpg1va35',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS124G4Z34xx7Ys19VYZXf52eRJ6khCB8DD5NPZDNT3jUrTLAYzCa',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12PDi8c4LZr41ypAJ8Gjppes3CVAz2J3xrQjGvTrQv7wea7Y68U',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12p2d3K3gGp6dXw1A1ZusPxUr9MzbLZqKZjrQ6Z8FWsnAH9F8Lv',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12bWaEB6jHXxX8SUrvXpb5xzFSSigSK9rV9BCpHffJyqozQwrTq',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12s7eFNQWXzCkU4NF4VBHsEBJEbnCBohdpu2DZbwXpRKeLPEstd',
  [ChainId.MAINNET]: ''
}

export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1yphCWi7gychZWYPpqrKDiGb6ZacRoji8YYMLHtQ2TSuuQFqLC',
  [ChainId.MAINNET]: ''
}
