import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12kpx6rSt36HpqipqSSNVQmw7WXZyC3GjLATNenoyoMYX1bP4XV',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1qCXCY5AF7SpZUk2bwiHneYb5MLVgeWEiRs8BxorYArLWMavZ',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12o8B3xPdY7a9ZbedwxRStLQAiDqp531LR7fChwqhkhfR3rurCB',
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
