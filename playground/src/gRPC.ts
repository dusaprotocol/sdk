import { Bin, REAL_ID_SHIFT } from '@dusalabs/sdk'
import { GrpcProvider } from '@massalabs/massa-web3'

export const gRPC = async () => {
  console.log('\n------- gRPC() called -------\n')

  const client = GrpcProvider.mainnet()
  client.getNodeStatus()
  // client.networkInfos().then(console.log)
  // client.networkInfos().then(console.log)
}
