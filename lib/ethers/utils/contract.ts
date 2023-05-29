import { Args, Client, MassaUnits } from '@massalabs/massa-web3'
import { ABI } from 'abis/ts'

export class Contract {
  // [key: string]: any

  constructor(public address: string, public abi: ABI, public client: Client) {
    for (const func of abi) {
      // Dynamically create a method for each function
      // @ts-ignore
      this[func.name] = async (...args: any[]) => {
        console.log(`Calling ${func.name} with arguments:`, args)

        // Call the smart contract
        const txId = await this.client.smartContracts().callSmartContract({
          targetAddress: this.address,
          functionName: func.name,
          parameter: new Args().serialize(),
          fee: MassaUnits.mMassa,
          coins: BigInt(0),
          maxGas: BigInt(100_000_000)
        })
        console.log(`Transaction ID: ${txId}`)
      }
    }
  }
}
