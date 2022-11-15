import NBuffer from "@nodetf/buffer";
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { unzipSync, deflateSync } from "node:zlib"
import NBTBase from "./index";

const compressed = readFileSync(resolve(process.cwd(),"bigtest.nbt"))

const uncompressed = unzipSync(compressed)

const buffer = new NBuffer(uncompressed)

buffer.endian = "big"

const tag = NBTBase.readTag(buffer)

console.dir(tag)