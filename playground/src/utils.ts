import { Account, JsonRpcProvider, Web3Provider } from '@massalabs/massa-web3'

export const logEvents = (client: Web3Provider, txId: string): void => {
  client
    .getEvents({ operationId: txId })
    .then((r) =>
      r.forEach((e) =>
        console.log(
          e.data.includes('massa_execution_error')
            ? e.context.call_stack
            : e.context.call_stack.at(-1),
          e.data
        )
      )
    )
}

export const createClient = (baseAccount: Account, mainnet = false) =>
  mainnet
    ? JsonRpcProvider.mainnet(baseAccount)
    : JsonRpcProvider.buildnet(baseAccount)
