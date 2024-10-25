import { Account, Web3Provider } from '@massalabs/massa-web3'
import { DefaultProviderUrls } from '@massalabs/web3-utils'

export const logEvents = (client: Web3Provider, txId: string): void => {
  client
    .getEvents({ operationId: txId })
    .then((r) => r.forEach((e) => console.log(e.data)))
}

export const createClient = async (baseAccount: Account, mainnet = false) =>
  Web3Provider.fromRPCUrl(
    mainnet ? DefaultProviderUrls.MAINNET : DefaultProviderUrls.BUILDNET,
    baseAccount
  )
