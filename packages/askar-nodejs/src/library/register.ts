import type {NativeMethods} from "./NativeBindingInterface";
import {nativeBindings} from "./bindings"; 

import fs from 'fs'
import os from 'os'
import path from 'path'
import koffi from 'koffi'

const LIBNAME = 'aries_askar'
const ENV_VAR = 'LIB_ASKAR_PATH'

type Platform = "darwin" | "linux" | "win32";

type ExtensionMap = Record<Platform, { prefix?: string; extension: string }>;

const extensions: ExtensionMap = {
  darwin: { prefix: 'lib', extension: '.dylib' },
  linux: { prefix: 'lib', extension: '.so' },
  win32: { extension: '.dll' },
}

const libPaths: Record<Platform, string[]> = {
  darwin: ['/usr/local/lib/', '/usr/lib/', '/opt/homebrew/opt/'],
  linux: ['/usr/lib/', '/usr/local/lib/'],
  win32: ['c:\\windows\\system32\\'],
}

const doesPathExist = fs.existsSync

function getLibraryPath(): NativeMethods {
  const platform = os.platform();
  
  if (platform !== 'linux' && platform !== 'win32' && platform !== 'darwin')
    throw new Error(`Unsupported platform: ${platform}. linux, win32 and darwin are supported.`);

  const pathFromEnvironment = process.env[ENV_VAR];
  const platformPaths = libPaths[platform];
  platformPaths.unshift(path.join(__dirname, '../../native'));

  if (pathFromEnvironment) platformPaths.unshift(pathFromEnvironment);

  const libraries = platformPaths.map((p) =>
    path.join(p, `${extensions[platform].prefix ?? ''}${LIBNAME}${extensions[platform].extension}`)
  );

  if (!libraries.some(doesPathExist))
    throw new Error(`Could not find ${LIBNAME} with these paths: ${libraries.join(' ')}`);

  const validLibraryPath = libraries.find((l) => doesPathExist(l)) as string;
  const lib = koffi.load(validLibraryPath);

  const boundMethods: Partial<NativeMethods> = {};
  for (const [funcName, signature] of Object.entries(nativeBindings)) {
    try {
      boundMethods[funcName as keyof NativeMethods] = lib.func(signature as string);
    } catch (error) {
      console.warn(`Warning: Failed to bind function ${funcName}: ${error}`);
    }
  }
  console.log("nativeAskar keys:", Object.keys(boundMethods));
  return boundMethods as NativeMethods;
}

let nativeAskar: NativeMethods | undefined;

export const getNativeAskar = () => {
  if (!nativeAskar) {
    nativeAskar = getLibraryPath();
  }
  return nativeAskar;
};

  