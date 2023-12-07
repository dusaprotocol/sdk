import { describe, it, expect } from 'vitest'
import { ILBPair } from '../contracts/LBPair'
import { ClientFactory, DefaultProviderUrls, ProviderType, WalletClient } from '@massalabs/massa-web3'

const BUILDNET_URL = DefaultProviderUrls.BUILDNET
const privateKey = process.env.PRIVATE_KEY
if (!privateKey) throw new Error('Missing PRIVATE_KEY in .env file')
const account = await WalletClient.getAccountFromSecretKey(privateKey)
if (!account.address) throw new Error('Missing address in account')
const client = await ClientFactory.createCustomClient(
  [
    { url: BUILDNET_URL, type: ProviderType.PUBLIC },
    { url: BUILDNET_URL, type: ProviderType.PRIVATE }
  ],
  true,
  account
)

describe('decode', () => {
  it('userBins', async () => {
    const lbPair = new ILBPair("AS12SyYeTmBFJgBGZup7m9DZ1gV4HPTmZRthDRihDfDzfsJ7HLk7m", client);
    const userbins = await lbPair.getUserBins("AU1cBirTno1FrMVpUMT96KiQ97wBqqM1z9uJLr3XZKQwJjFLPEar");
    expect(userbins).toStrictEqual([8391258,8391259,8391260]);
  })
})
