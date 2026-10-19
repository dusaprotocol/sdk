import { describe, it, expect, vi } from 'vitest'
import {
  MRC20AllowanceCreationCost,
  MRC20BalanceCreationCost,
  Operation,
  Provider
} from '@massalabs/massa-web3'
import { IERC20 } from '..'

const TOKEN = 'AS12U4TZfNK7qoLyEERBBRDMu8nm5MKoRzPXDXans4v9wdATZedz9'
const OWNER = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq'
const SPENDER = 'AS1Wse7vxWvB1iP1DwNQTQQctwU1fQ1jrq5JgdSPZH132UYrYrXF'
const RECIPIENT = 'AU1wN8rn4SkwYSTDF3dHFY4U28KtsqKL1NnEjDZhHnHEy6cEQm53'

const WRITES = ['increaseAllowance', 'transfer', 'transferFrom', 'mint']
type ReadOnlyCall = { func: string; coins?: bigint }

/*
 * A provider for OWNER on a token whose datastore holds `entries`, behaving like an
 * MRC20 0.1.0 token (WMAS once MIP-0002 is active): a call that creates an entry
 * without the coins to pay for it reverts with SPENT_MORE_COINS_THAN_SENT.
 */
const tokenWith = (entries: string[], entryCost: bigint) => {
  const readStorage = vi.fn(async (_address: string, keys: string[]) =>
    keys.map((key) => (entries.includes(key) ? new Uint8Array(32) : null))
  )
  const readSC = vi.fn(async ({ func, coins }: ReadOnlyCall) => ({
    // views (allowance, balanceOf) answer a zero u256
    value: new Uint8Array(32),
    info: {
      error:
        WRITES.includes(func) && (coins ?? 0n) < entryCost
          ? 'VM Error in ReadOnlyExecutionTarget::FunctionCall context: Runtime error: SPENT_MORE_COINS_THAN_SENT'
          : undefined,
      events: [],
      gasCost: 1_000_000
    }
  }))
  const callSC = vi.fn(async () => new Operation({} as Provider, 'O1'))
  const provider = {
    address: OWNER,
    readStorage,
    readSC,
    callSC
  } as unknown as Provider
  const sentCoins = () => (callSC.mock.calls[0] as any)[0].coins as bigint
  return { token: new IERC20(TOKEN, provider), provider, sentCoins }
}

describe('IERC20 storage coins', () => {
  it('increaseAllowance pays for a new allowance entry', async () => {
    const { provider } = tokenWith([], 0n)
    const cost = await MRC20AllowanceCreationCost(
      provider,
      TOKEN,
      OWNER,
      SPENDER
    )
    expect(cost).toBeGreaterThan(0n)

    const { token, sentCoins } = tokenWith([], cost)
    await token.increaseAllowance(SPENDER, 10n)

    expect(sentCoins()).toBe(cost)
  })

  it('increaseAllowance sends no coins for an existing allowance', async () => {
    const { token, sentCoins } = tokenWith([`ALLOWANCE${OWNER}${SPENDER}`], 0n)
    await token.increaseAllowance(SPENDER, 10n)

    expect(sentCoins()).toBe(0n)
  })

  it('approve pays for a new allowance entry', async () => {
    const { provider } = tokenWith([], 0n)
    const cost = await MRC20AllowanceCreationCost(
      provider,
      TOKEN,
      OWNER,
      SPENDER
    )

    const { token, sentCoins } = tokenWith([], cost)
    // the current allowance is read with readSC: 0
    await token.approve(OWNER, SPENDER, 10n)

    expect(sentCoins()).toBe(cost)
  })

  it('transfer pays for a new recipient balance', async () => {
    const { provider } = tokenWith([], 0n)
    const cost = await MRC20BalanceCreationCost(provider, TOKEN, RECIPIENT)
    expect(cost).toBeGreaterThan(0n)

    const { token, sentCoins } = tokenWith([], cost)
    await token.transfer(RECIPIENT, 10n)

    expect(sentCoins()).toBe(cost)
  })

  it('transfer sends no coins to an existing holder', async () => {
    const { token, sentCoins } = tokenWith([`BALANCE${RECIPIENT}`], 0n)
    await token.transfer(RECIPIENT, 10n)

    expect(sentCoins()).toBe(0n)
  })
})
