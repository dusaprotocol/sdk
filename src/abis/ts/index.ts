export * from './LBFactory'
export * from './LBPair'
export * from './LBQuoter'
export * from './LBRouter'

// ======== Own code ========

interface FunctionInput {
  name: string
  type: string
  // type: Arg | Arg[]
}

interface FunctionOutput {
  type: string
  name: string
}

const nativeASTypes = [
  'bool',
  'u8',
  'u32',
  'u64',
  'i64',
  'u128',
  'i128',
  'string',
  'void'
] as const
export type NativeASTypes = (typeof nativeASTypes)[number]

interface ABIItem {
  inputs: FunctionInput[]
  stateMutability?: 'nonpayable' | 'payable' | 'view'
  name: string
  outputs?: FunctionOutput
}

export type ABI = ABIItem[]
