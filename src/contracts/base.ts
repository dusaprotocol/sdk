import { Client } from '@massalabs/massa-web3'

export class IBaseContract {
  constructor(public address: string, protected client: Client) {}
}
