import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import NBTTag from ".";

const file = readFileSync(resolve(process.cwd(),"bigtest.nbt"))

const tag = NBTTag.read(file)

console.dir(tag.toJSON())