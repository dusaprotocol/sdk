import { describe, it, expect, vi } from 'vitest'
import { JsonRpcPublicProvider, Provider } from '@massalabs/massa-web3'
import { ILBPair } from '..'

const PAIR = 'AS12Q5NyCQUtEBTnnqqBwcGyYb18szbbKv5GArcdk9tm2HitTupHw'
// max_datastore_keys_query of a node: the most keys returned by one query
const NODE_CAP = 500

const toKey = (s: string): number[] => Array.from(Buffer.from(s))

const compareKeys = (a: number[], b: number[]): number => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return a.length - b.length
}

type KeysRequest = {
  address: string
  is_final: boolean
  prefix: number[]
  start_key: number[] | null
  count: number | null
}

// A node holding `keys` for the pair, in byte order, that returns at most
// NODE_CAP keys per query, like a node with max_datastore_keys_query = 500.
const pairWithDatastore = (keys: number[][]) => {
  const sorted = [...keys].sort(compareKeys)
  const provider = JsonRpcPublicProvider.fromRPCUrl('http://node')
  const connector = (
    provider as unknown as {
      client: { connector: Record<string, unknown> }
    }
  ).client.connector

  const getAddressesKeys = vi.fn(async (requests: KeysRequest[]) =>
    requests.map((req) => ({
      address: req.address,
      is_final: req.is_final,
      keys: sorted
        .filter((key) => req.prefix.every((byte, i) => key[i] === byte))
        .filter((key) => !req.start_key || compareKeys(key, req.start_key) > 0)
        .slice(0, Math.min(req.count ?? NODE_CAP, NODE_CAP))
    }))
  )
  // get_addresses lists at most NODE_CAP keys of the whole datastore
  const getAddresses = vi.fn(async () => [
    {
      final_datastore_keys: sorted.slice(0, NODE_CAP),
      candidate_datastore_keys: sorted.slice(0, NODE_CAP)
    }
  ])
  connector.get_addresses_keys = getAddressesKeys
  connector.get_addresses = getAddresses

  const pair = new ILBPair(PAIR, provider as unknown as Provider)
  return { pair, getAddressesKeys, getAddresses }
}

describe('ILBPair.getBinIds', () => {
  it('returns every bin of a pool holding more keys than the node cap', async () => {
    const binIds = Array.from({ length: 1200 }, (_, i) => 8_388_000 + i)
    // a pool also holds other keys, some sorted before the bins
    const otherKeys = Array.from({ length: 800 }, (_, i) =>
      toKey(`balance::AU1user${i}`)
    )
    const { pair, getAddresses } = pairWithDatastore([
      ...otherKeys,
      ...binIds.map((id) => toKey(`bin::${id}`)),
      toKey('tree::0'),
      toKey('PAIR_INFORMATION')
    ])

    const result = await pair.getBinIds()

    expect([...result].sort((a, b) => a - b)).toEqual(binIds)
    expect(getAddresses).not.toHaveBeenCalled()
  })

  it('lists only the bin keys, paged, with the prefix applied by the node', async () => {
    const { pair, getAddressesKeys } = pairWithDatastore(
      Array.from({ length: 1200 }, (_, i) => toKey(`bin::${i}`))
    )

    await pair.getBinIds()

    const requests = getAddressesKeys.mock.calls.flatMap(
      ([reqs]) => reqs as KeysRequest[]
    )
    // 1200 bins: pages of 500, 500 and 200
    expect(requests).toHaveLength(3)
    for (const req of requests) {
      expect(req.address).toBe(PAIR)
      expect(req.prefix).toEqual(toKey('bin::'))
    }
  })
})
