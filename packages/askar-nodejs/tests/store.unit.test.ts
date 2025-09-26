import { deepStrictEqual, doesNotReject, ok, rejects, strictEqual } from 'node:assert'
import { promises } from 'node:fs'
import { afterEach, before, beforeEach, describe, test } from 'node:test'
import { AskarError, KdfMethod, Key, KeyAlgorithm, Store, StoreKeyMethod } from '@openwallet-foundation/askar-shared'
import { firstEntry, getRawKey, secondEntry, setup, setupWallet, testStoreUri } from './utils'

describe('Store and Session', () => {
  let store: Store

  before(setup)

  beforeEach(async () => {
    store = await setupWallet()
  })

  afterEach(async () => {
    await store.close(true)
  })

  test('Fetch all without category', async () => {
    const session = await store.openSession()

    await session.insert(firstEntry)
    await session.insert(secondEntry)

    strictEqual(await session.count(firstEntry), 2)
    strictEqual(await session.count({}), 2)

    strictEqual((await session.fetchAll({})).length, 2)
    await session.removeAll({ category: firstEntry.category })

    strictEqual(await session.count(firstEntry), 0)

    await session.close()
  })


  // test('argon2i mod', async () => {
  //   const argon2iModStore = await Store.provision({
  //     recreate: true,
  //     passKey: 'abc',
  //     uri: testStoreUri,
  //     keyMethod: new StoreKeyMethod(KdfMethod.Argon2IMod),
  //   })

  //   const session = await argon2iModStore.openSession()

  //   strictEqual(await session.fetch({ name: 'unknownKey', category: 'unknownCategory' }), null)

  //   await argon2iModStore.close()
  // })

//   test('argon2i int', async () => {
//     const argon2iIntStore = await Store.provision({
//       recreate: true,
//       passKey: 'abc',
//       uri: testStoreUri,
//       keyMethod: new StoreKeyMethod(KdfMethod.Argon2IInt),
//     })

//     const session = await argon2iIntStore.openSession()

//     strictEqual(await session.fetch({ name: 'unknownKey', category: 'unknownCategory' }), null)

//     await argon2iIntStore.close()
//   })
})
