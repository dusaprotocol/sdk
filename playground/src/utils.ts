import { Account, Web3Provider } from '@massalabs/massa-web3'

export const logEvents = (client: Web3Provider, txId: string): void => {
  client
    .getEvents({ operationId: txId })
    .then((r) => r.forEach((e) => console.log(e.data)))
}

export const createClient = async (baseAccount: Account, mainnet = false) =>
  mainnet
    ? Web3Provider.mainnet(baseAccount)
    : Web3Provider.buildnet(baseAccount)
