import { Address } from '@massalabs/massa-web3'

export * from './eventDecoder'
export * from './liquidityDistribution'
export * from './quoterHelper'
export * from './router'

export const validateAddress = (address: string) => {
  try {
    Address.fromString(address)
    return true
  } catch {
    return false
  }
}
