import { Client, EOperationStatus, IEvent } from '@massalabs/massa-web3'

export const awaitFinalization = async (
  client: Client,
  txId: string
): Promise<void> => {
  await client
    .smartContracts()
    .awaitRequiredOperationStatus(txId, EOperationStatus.SPECULATIVE_SUCCESS)
    .then((status) => {
      if (status !== EOperationStatus.SPECULATIVE_SUCCESS) {
        throw new Error('Operation failed')
      }
    })
}

export const logEvents = (client: Client, txId: string): void => {
  client
    .smartContracts()
    .getFilteredScOutputEvents({
      emitter_address: null,
      start: null,
      end: null,
      original_caller_address: null,
      is_final: null,
      original_operation_id: txId
    })
    .then((r) => r.forEach((e) => console.log(e.data)))
}
