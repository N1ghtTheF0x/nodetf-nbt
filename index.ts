import NBuffer from "@nodetf/buffer";
import { deflateSync, gunzipSync } from "node:zlib"

abstract class NBTTag
{
    key?: string
    constructor(readonly type: NBTTag.Type)
    {

    }
    checkType(buffer: NBuffer): void
    checkType(type: NBTTag.Type): void
    checkType(a: NBuffer | NBTTag.Type)
    {
        const type = typeof a == "number" ? a : a.readInt8()
        if(this.type != type) throw new TypeError(`Wrong type! Is ${NBTTag.Type[type]}, should be ${NBTTag.Type[this.type]}!`)
    }
    readKey(buffer: NBuffer)
    {
        const length = buffer.readInt16()
        this.key = buffer.readString(length,"utf-8")
    }
    writeKey(buffer: NBuffer)
    {
        if(this.key == undefined) return
        buffer.writeInt16(this.key.length)
        buffer.writeString(this.key)
    }
    read(buffer: NBuffer,includeKey: boolean = true)
    {
        this.checkType(buffer)
        if(includeKey) this.readKey(buffer)
        this.readContent(buffer)
    }
    write(buffer: NBuffer,includeKey: boolean = true)
    {
        buffer.writeInt8(this.type)
        if(includeKey) this.writeKey(buffer)
        this.writeContent(buffer)
    }
    abstract readContent(buffer: NBuffer): this
    abstract writeContent(buffer: NBuffer): void
    abstract toJSON(): object
}

namespace NBTTag
{
    export enum Type
    {
        End,
        Byte,
        Short,
        Int,
        Long,
        Float,
        Double,
        ByteArray,
        String,
        List,
        Compound,
        IntArray,
        LongArray
    }
    export class End extends NBTTag
    {
        constructor()
        {
            super(Type.End)
        }
        readContent(buffer: NBuffer): this {
            return this
        }
        writeContent(buffer: NBuffer): void {
        }
        toJSON(): object {
            return {}
        }
    }
    export class Byte extends NBTTag
    {
        byte: number
        constructor(byte: number = 0)
        {
            super(Type.Byte)
            this.byte = byte
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt8(this.byte)
        }
        readContent(buffer: NBuffer): this {
            this.byte = buffer.readInt8()
            return this
        }
        toJSON(): object {
            return {
                byte: this.byte,
                key: this.key
            }
        }
    }
    export class Short extends NBTTag
    {
        short: number
        constructor(short: number = 0)
        {
            super(Type.Short)
            this.short = short
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt16(this.short)
        }
        readContent(buffer: NBuffer): this {
            this.short = buffer.readInt16()
            return this
        }
        toJSON(): object {
            return {
                short: this.short,
                key: this.key
            }
        }
    }
    export class Int extends NBTTag
    {
        int: number
        constructor(int: number = 0)
        {
            super(Type.Int)
            this.int = int
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt32(this.int)
        }
        readContent(buffer: NBuffer): this {
            this.int = buffer.readInt32()
            return this
        }
        toJSON(): object {
            return {
                int: this.int,
                key: this.key
            }
        }
    }
    export class Long extends NBTTag
    {
        long: bigint
        constructor(long: bigint = BigInt(0))
        {
            super(Type.Long)
            this.long = long
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt64(this.long)
        }
        readContent(buffer: NBuffer): this {
            this.long = buffer.readInt64()
            return this
        }
        toJSON(): object {
            return {
                long: this.long,
                key: this.key
            }
        }
    }
    export class Float extends NBTTag
    {
        float: number
        constructor(float: number = 0.0)
        {
            super(Type.Float)
            this.float = float
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeFloat(this.float)
        }
        readContent(buffer: NBuffer): this {
            this.float = buffer.readFloat()
            return this
        }
        toJSON(): object {
            return {
                float: this.float,
                key: this.key
            }
        }
    }
    export class Double extends NBTTag
    {
        double: number
        constructor(double: number = 0.0)
        {
            super(Type.Double)
            this.double = double
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeDouble(this.double)
        }
        readContent(buffer: NBuffer): this {
            this.double = buffer.readDouble()
            return this
        }
        toJSON(): object {
            return {
                double: this.double,
                key: this.key
            }
        }
    }
    export class ByteArray extends NBTTag
    {
        byteArray: Array<number>
        constructor(...arr: Array<number>)
        {
            super(Type.ByteArray)
            this.byteArray = arr
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt32(this.byteArray.length)
            buffer.writeArray(this.byteArray,NBuffer.SizeOf.Int8)
        }
        readContent(buffer: NBuffer): this {
            const length = buffer.readInt32()
            this.byteArray = buffer.readArray(length,NBuffer.SizeOf.Int8)
            return this
        }
        toJSON(): object {
            return {
                byteArray: this.byteArray,
                key: this.key
            }
        }
    }
    export class String extends NBTTag
    {
        string: string
        constructor(string: string = "")
        {
            super(Type.String)
            this.string = string
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt16(this.string.length)
            buffer.writeString(this.string,"utf-8")
        }
        readContent(buffer: NBuffer): this {
            const length = buffer.readInt16()
            this.string = globalThis.String.fromCharCode(...buffer.readArray(length,NBuffer.SizeOf.Int8))
            return this
        }
        toJSON(): object {
            return {
                string: this.string,
                key: this.key
            }
        }
    }
    export class List extends NBTTag
    {
        listType: Type
        list: Array<NBTTag>
        constructor(type: Type,...arr: Array<NBTTag>)
        {
            super(Type.List)
            this.listType = type
            this.list = arr
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt32(this.list.length)
            buffer.writeInt8(this.listType)
            for(const tag of this.list) tag.write(buffer,false)
            buffer.writeInt8(Type.End)
        }
        readContent(buffer: NBuffer): this {
            this.list = []
            this.listType = buffer.readInt8() as Type
            const length = buffer.readInt32()
            for(var index = 0;index < length;index++) this.list.push(NBTTag.create(buffer))
            buffer.readInt8()
            return this
        }
        toJSON(): object {
            return {
                listType: this.listType,
                tags: this.list.map((t) => t.toJSON()),
                key: this.key
            }
        }
    }
    export class Compound extends NBTTag
    {
        map: Map<string,NBTTag>
        constructor(map: Map<string,NBTTag> = new Map())
        {
            super(Type.Compound)
            this.map = map
        }
        writeContent(buffer: NBuffer): void {
            for(const tag of this.map.values()) tag.write(buffer)
            buffer.writeInt8(Type.End)
        }
        readContent(buffer: NBuffer): this {
            this.map = new Map()
            while(buffer.readOffset >= buffer.length) 
            {
                const tag = NBTTag.create(buffer)
                if(tag.type == Type.End) break
                this.map.set(tag.key as string,tag)
            }
            return this
        }
        toJSON(): object {
            return {
                map: this.map,
                key: this.key
            }
        }
    }
    export class IntArray extends NBTTag
    {
        intArray: Array<number>
        constructor(...arr: Array<number>)
        {
            super(Type.IntArray)
            this.intArray = arr
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt32(this.intArray.length)
            buffer.writeArray(this.intArray,NBuffer.SizeOf.Int32)
        }
        readContent(buffer: NBuffer): this {
            const length = buffer.readInt32()
            this.intArray = buffer.readArray(length,NBuffer.SizeOf.Int32)
            return this
        }
        toJSON(): object {
            return {
                intArray: this.intArray,
                key: this.key
            }
        }
    }
    export class LongArray extends NBTTag
    {
        longArray: Array<bigint>
        constructor(...arr: Array<bigint>)
        {
            super(Type.ByteArray)
            this.longArray = arr
        }
        writeContent(buffer: NBuffer): void {
            buffer.writeInt32(this.longArray.length)
            buffer.writeArray(this.longArray,NBuffer.SizeOf.Int64)
        }
        readContent(buffer: NBuffer): this {
            const length = buffer.readInt32()
            this.longArray = buffer.readArray(length,NBuffer.SizeOf.Int64)
            return this
        }
        toJSON(): object {
            return {
                longArray: this.longArray,
                key: this.key
            }
        }
    }
    export function create(buffer: NBuffer): NBTTag
    {
        const type = buffer.readInt8() as Type
        buffer.readOffset -= NBuffer.SizeOf.Int8
        switch(type)
        {
            case Type.End:
                return new NBTTag.End().readContent(buffer)
            case Type.Byte:
                return new NBTTag.Byte().readContent(buffer)
            case Type.Short:
                return new NBTTag.Short().readContent(buffer)
            case Type.Int:
                return new NBTTag.Int().readContent(buffer)
            case Type.Long:
                return new NBTTag.Long().readContent(buffer)
            case Type.Float:
                return new NBTTag.Float().readContent(buffer)
            case Type.Double:
                return new NBTTag.Double().readContent(buffer)
            case Type.ByteArray:
                return new NBTTag.ByteArray().readContent(buffer)
            case Type.String:
                return new NBTTag.String().readContent(buffer)
            case Type.List:
                return new NBTTag.List(NaN).readContent(buffer)
            case Type.Compound:
                return new NBTTag.Compound().readContent(buffer)
            case Type.IntArray:
                return new NBTTag.IntArray().readContent(buffer)
            case Type.LongArray:
                return new NBTTag.LongArray().readContent(buffer)
        }
    }
    export function readTag(buffer: Buffer): NBTTag
    export function readTag(buffer: NBuffer): NBTTag
    export function readTag(b: NBuffer | Buffer)
    {
        const buffer = Buffer.isBuffer(b) ? new NBuffer(b) : b
        return create(buffer)
    }
    export function readGZip(cbuffer: Buffer)
    {
        const buffer = gunzipSync(cbuffer)
        return readTag(new NBuffer(buffer))
    }
    export function readZLib(cbuffer: Buffer)
    {
        const buffer = deflateSync(cbuffer)
        return readTag(new NBuffer(buffer))
    }
}

export default NBTTag