import { ChainId } from './internal'

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12PYRpLuQevC5vxSCcPavaJMXktQ8yvS1gG8uQzHyfDQwapurk7',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS123iXAK1r1nHXf2R4LoyiMkMKLcajheYnX6o1FRJsspjr2278WW',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS12Mf1nPpxWyMSqgRpB4FJ93dMb1YVyGpyCzeGEpswDbEfmxnb9w',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1kcpcfjK4L63CiQ7wHivHLjpLcvA24m6hEwJLXUSuRzfbmg78e',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.BUILDNET]: 'AS1aA1oZ9ehW1sd54GzcxzntGzbC7fHFDSFDMNbBBdw61TKrtmv8',
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
