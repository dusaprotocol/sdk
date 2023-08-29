import { Args, Client, bytesToU64 } from '@massalabs/massa-web3'

export class IERC20 {
  constructor(public address: string, private client: Client) {}

  async balanceOf(address: string): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'balanceOf',
        parameter: new Args().addString(address).serialize(),
        maxGas: 1_000_000_000n
      })
      .then((res) => {
        return bytesToU64(res.returnValue)
      })
  }

  async allowance(address: string, spender: string): Promise<bigint> {
    return this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.address,
        targetFunction: 'allowance',
        parameter: new Args().addString(address).addString(spender).serialize(),
        maxGas: 1_000_000_000n
      })
      .then((res) => {
        return bytesToU64(res.returnValue)
      })
  }

  async approve(
    spender: string,
    amount: bigint = 2n ** 256n - 1n
  ): Promise<string> {
    const owner = this.client.wallet().getBaseAccount()?.address()
    if (!owner) throw new Error('No base account')

    const currentAllowance = await this.allowance(owner, spender)

    if (currentAllowance >= amount) return ''
    amount -= currentAllowance
    console.log({ currentAllowance, amount })

    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'increaseAllowance',
      parameter: new Args().addString(spender).addU256(amount).serialize(),
      maxGas: 100_000_000n,
      fee: 0n,
      coins: 0n
    })
  }

  async transfer(spender: string, amount: bigint): Promise<string> {
    const owner = this.client.wallet().getBaseAccount()?.address()
    if (!owner) throw new Error('No base account')

    return this.client.smartContracts().callSmartContract({
      targetAddress: this.address,
      functionName: 'transfer',
      parameter: new Args().addString(spender).addU256(amount).serialize(),
      maxGas: 100_000_000n,
      fee: 0n,
      coins: 0n
    })
  }
}
