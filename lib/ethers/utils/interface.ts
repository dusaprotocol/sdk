import { ABI, LBQuoterABI } from '../../../src/abis/ts'

export class Interface {
  constructor(public abi: any) {}
}

function createClass(abi: ABI) {
  //  class Contract {
  //   [key: abi]

  //   constructor() {
  //     for (let property of abi) {
  //       this[property.name] = () => {
  //         console.log(`Calling ${property.name} with arguments:`)
  //       }
  //     }
  //   }
  // }
  // return new Contract()

  return class {
    [key: string]: any

    constructor() {
      for (let property of abi) {
        let name = property.name
        this[name] = () => {
          console.log(`Calling ${name} with arguments:`)
        }
      }
    }
  }
}

const x = createClass(LBQuoterABI)
x.apply
