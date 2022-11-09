import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import NBTTag from "./index";

const file = readFileSync(resolve(process.cwd(),"bigtest.nbt"))

const tag = NBTTag.readGZip(file)

console.dir(tag.toJSON())