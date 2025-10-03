import { KdfMethod, LogLevel, Store, StoreKeyMethod, askar, registerAskar } from '@openwallet-foundation/askar-shared'
import { NodeJSAskar } from '../../src/NodeJSAskar'

export const getRawKey = () => Store.generateRawKey(Buffer.from('00000000000000000000000000000My1'))
export const testStoreUri = process.env.URI || 'sqlite://:memory:'

export const setupWallet = async () => {
  const key = getRawKey()
  console.log("key", key,"key type",typeof key);
  console.log("Starting Store.provision....");
   const store = await Store.provision({
    recreate: true,
    uri: testStoreUri,
    keyMethod: new StoreKeyMethod(KdfMethod.Raw),
    passKey: key,
  })
  console.log("Store.provision done:", store);
  return store
}

export const setup = () => {
  registerAskar({ askar: new NodeJSAskar() })
  console.log("Askar registered!");
  askar.setDefaultLogger()
  console.log("Logger set!");

  // console.log("keys:", Object.keys(askar))
  // console.log("all props:", Object.getOwnPropertyNames(askar))
  // console.log("proto props:", Object.getOwnPropertyNames(Object.getPrototypeOf(askar)))
  
  // console.log("askar version:", askar.version())
}

export const base64url = (str: string) => Buffer.from(str).toString('base64url')