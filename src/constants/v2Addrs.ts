import { ChainId } from './internal'

type AddressMap = { [chainId in ChainId]: string }

/**
 * DEX core SDK
 */
export const LB_QUOTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1Wse7vxWvB1iP1DwNQTQQctwU1fQ1jrq5JgdSPZH132UYrYrXF',
  [ChainId.MAINNET]: 'AS12VBT5xeL3XdXhLwnpyMVB8re5RcMuW4Z8ragCKEKnDDCEkYjXL'
}

export const V2_LB_QUOTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1UqXdCJmUdERnk87GqiXRLqF5cXfm7q3x49ng63xpZKLAiEgRN',
  [ChainId.MAINNET]: ''
}

export const LB_ROUTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1XqtvX3rz2RWbnqLfaYVKEjM3VS5pny9yKDdXcmJ5C1vrcLEFd',
  [ChainId.MAINNET]: 'AS12UMSUxgpRBB6ArZDJ19arHoxNkkpdfofQGekAiAJqsuE6PEFJy'
}

export const V2_LB_ROUTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1Ui3SMj1U8CkPq2ENiDf2WbDYbSGcJTHPW1vVR8eo5N13aPY2f',
  [ChainId.MAINNET]: ''
}

export const V0_ROUTER_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS1bCBYc1sbWBgDs68Cfv89xtLSyH93Yd3RjBJzqq5QYEH4iaDRJ',
  [ChainId.MAINNET]: ''
}

export const LB_FACTORY_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS125Y3UWiMoEx3w71jf7iq1RwkxXdwkEVdoucBTAmvyzGh2KUqXS',
  [ChainId.MAINNET]: 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX'
}

export const V2_LB_FACTORY_ADDRESS: AddressMap = {
  [ChainId.BUILDNET]: 'AS13uiAxVBNWEBgnQ1yT5wB3raCPKu5KQJrUGgp9UNfjxXWHfwAq',
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
  [ChainId.BUILDNET]: 'AS12Sm9oqH2C26fx7v8ZYCwyKs9LmrmRGX2WRJT3aK7KnYtrMhq8n',
  [ChainId.MAINNET]: 'AS1KoegDzwkFiWgv6rKKZHckiwbgSEiXh7hfXsGPb4neJTGKoWCv'
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
