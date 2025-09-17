import { ChainId } from './internal'

type AddressMap = { [chainId in ChainId]: string }

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1q45sfLjzGd2LrRQYLfhimXnxre8SqDeyvRE7Y4aQuH6MheHb7',
  [ChainId.MAINNET]: 'AS128hBKoHbgXdiBXp8ji2KuT8krDFSjLnakw38GN4xcL3XyR9yFF'
}

export const LB_ROUTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS15VtUroncrrPHEsRBsdzRjyomJ42emZWdSDEbCj4gU8YctrAU7',
  [ChainId.MAINNET]: 'AS12UMSUxgpRBB6ArZDJ19arHoxNkkpdfofQGekAiAJqsuE6PEFJy'
}

export const LB_FACTORY_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS125Y3UWiMoEx3w71jf7iq1RwkxXdwkEVdoucBTAmvyzGh2KUqXS',
  [ChainId.MAINNET]: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX'
}

export const V2_LB_FACTORY_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1eabgwfn9zjWJum8HweHjLXPmdeTJ27DmFYJZmJCd1bM4KcZ6j',
  [ChainId.MAINNET]: ''
}

export const V0_FACTORY_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1f9vUWC2mm4QFVsLpM1XeaWdtUKofGacDJZjJDGrgNogwWpFbh',
  [ChainId.MAINNET]: ''
}

/**
 * DEX periphery SDK
 */

export const DCA_MANAGER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1VuksUQ5hPRZXV4jfHBvPzcB2aRg9F4wHyvXEMCga7ijo8f3Rs',
  [ChainId.MAINNET]: ''
}

export const LIMIT_ORDER_MANAGER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: '',
  [ChainId.MAINNET]: ''
}

export const VAULT_MANAGER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: '',
  [ChainId.MAINNET]: ''
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1yphCWi7gychZWYPpqrKDiGb6ZacRoji8YYMLHtQ2TSuuQFqLC',
  [ChainId.MAINNET]: 'AS1FJrNBtZ5oXK9y6Wcmiio5AV6rR2UopqqdQWhBH4Fss9JNMySm'
}

/**
 * DEX governance SDK
 */

export const VOTING_ESCROW_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: '',
  [ChainId.MAINNET]: 'AS1q76iSMJ8Dj5gVBVK26y11yuFi9eVzUmTzwf5ANgoypMVcNjXj'
}

export const VOTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: '',
  [ChainId.MAINNET]: 'AS1rg37d1cFXrSXbEaKbGPBKRXahshk6VgvwJXjg48MbyuwM1ea6'
}
