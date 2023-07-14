import { Client } from '@massalabs/massa-web3'
import { ABI } from '../../../src/abis/ts'

export class Contract {
  constructor(public address: string, public abi: ABI, public client: Client) {
    for (const func of abi) {
      const methodName = func.name
      Object.defineProperty(this, methodName, {
        value: () => {
          console.log(
            `Calling method: ${methodName} with arguments: ${func.inputs.map(
              (input) => `${input.name}: ${input.type}`
            )}`
          )
          // Implement method logic here
        },
        writable: true,
        enumerable: true,
        configurable: true
      })
    }
  }

  [key: string]: any
}
