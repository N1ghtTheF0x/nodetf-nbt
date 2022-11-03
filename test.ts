import NBuffer from "@nodetf/buffer";

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import NBTTag from ".";

const file = readFileSync(resolve(process.cwd(),"test.nbt"))

const buffer = new NBuffer(file)

const tag = NBTTag.read(buffer)

console.dir(tag.toJSON())