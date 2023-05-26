export * from './LBFactory'
export * from './LBPair'
export * from './LBQuoter'
export * from './LBRouter'
export * from './LBRewarder'
export * from './Vault'
export * from './VaultFactory'

export interface ABI {
  inputs: { internalType: string; name: string; type: Arg | Arg[] }[]
  type: ABIType
  stateMutability?: 'nonpayable' | 'payable' | 'view'
  name?: string
  outputs?: {
    components?: any
    internalType: string
    name: string
    type: Arg
  }[]
}

// type Arg = 'u8' | 'u64' | 'u128' | 'string' | 'address'
type Arg =
  | 'uint8'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'int256'
  | 'string'
  | 'address'
  | 'tuple'
  | 'address[]'

type ABIType = 'function' | 'event' | 'constructor' | 'fallback' | 'error'
