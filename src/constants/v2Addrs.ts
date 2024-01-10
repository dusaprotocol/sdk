import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12tA9SKwPxhRZorBWYhMQyAw2M3jff1MzS23NJ3FkNPBc1h3wBD',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12LeJ6YQsnhmAamnLqpezwKLTV8VNwwryt6X72fVZtmCv41YJJD',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1DCvSdt7igp4mixF4m4X7dMw5Js77hxJ1tdfQU8D7U38ZjGkqm',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1PL5KguQrUJfyUkTN86A6iqhyRhRBuQxmnA1pFPkQ6quuSN3N1',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1a7jSNWTqpS3iU2iypfwvTPQmW9eivRB5aYZ5km14VRyiCtgbN',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS125znAYtVCJ2Qd5up1x7ffnDzuMEzMCYgyjJ82uc65FaeBFVPAn',
  [ChainId.MAINNET]: ''
}

export const MULTICALL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1yphCWi7gychZWYPpqrKDiGb6ZacRoji8YYMLHtQ2TSuuQFqLC',
  [ChainId.MAINNET]: ''
}
