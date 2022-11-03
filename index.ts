import NBuffer from "@nodetf/buffer";

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
    abstract read(buffer: NBuffer): void
    abstract write(buffer: NBuffer): void
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
        read(buffer: NBuffer): void {
            this.checkType(buffer)
        }
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt8(this.byte)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.byte = buffer.readInt8()
        }
        toJSON(): object {
            return {
                byte: this.byte
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt16(this.short)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.short = buffer.readInt16()
        }
        toJSON(): object {
            return {
                short: this.short
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt32(this.int)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.int = buffer.readInt32()
        }
        toJSON(): object {
            return {
                int: this.int
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt64(this.long)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.long = buffer.readInt64()
        }
        toJSON(): object {
            return {
                long: this.long
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeFloat(this.float)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.float = buffer.readFloat()
        }
        toJSON(): object {
            return {
                float: this.float
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeDouble(this.double)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            this.double = buffer.readDouble()
        }
        toJSON(): object {
            return {
                double: this.double
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt32(this.byteArray.length)
            buffer.writeArray(this.byteArray,NBuffer.SizeOf.Int8)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            const length = buffer.readInt32()
            this.byteArray = buffer.readArray(length,NBuffer.SizeOf.Int8)
        }
        toJSON(): object {
            return {
                byteArray: this.byteArray
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt16(this.string.length)
            buffer.writeString(this.string,"utf-8")
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            const length = buffer.readInt16()
            this.string = buffer.readString(length,"utf-8")
        }
        toJSON(): object {
            return {
                string: this.string
            }
        }
    }
    export class List extends NBTTag
    {
        readonly listType: Type
        list: Array<NBTTag>
        constructor(type: Type,...arr: Array<NBTTag>)
        {
            super(Type.List)
            this.listType = type
            this.list = arr
        }
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt32(this.list.length)
            for(const tag of this.list) tag.write(buffer)
            buffer.writeInt8(Type.End)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.list = []
            this.readKey(buffer)
            const length = buffer.readInt32()
            for(var index = 0;index < length;index++)
            {
                const tag = NBTTag.create(this.listType)
                tag.read(buffer)
                this.list.push(tag)
            }
            buffer.readInt8()
        }
        toJSON(): object {
            return {
                listType: this.listType,
                tags: this.list.map((t) => t.toJSON())
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            for(const tag of this.map.values()) tag.write(buffer)
            buffer.writeInt8(Type.End)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.map = new Map()
            this.readKey(buffer)
            this.#readTag(buffer)
        }
        #readTag(buffer: NBuffer)
        {
            try
            {
                const tag = read(buffer)
                if(tag.type == Type.End) return
                this.map.set(tag.key as string,tag)
                this.#readTag(buffer)
            }
            catch(e)
            {
                
            }
        }
        toJSON(): object {
            return {
                map: this.map
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt32(this.intArray.length)
            buffer.writeArray(this.intArray,NBuffer.SizeOf.Int32)
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            const length = buffer.readInt32()
            this.intArray = buffer.readArray(length,NBuffer.SizeOf.Int32)
        }
        toJSON(): object {
            return {
                intArray: this.intArray
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
        write(buffer: NBuffer): void {
            buffer.writeInt8(this.type)
            this.writeKey(buffer)
            buffer.writeInt32(this.longArray.length)
            for(var i = 0;i < this.longArray.length;i++) buffer.writeInt64(this.longArray[i])
        }
        read(buffer: NBuffer): void {
            this.checkType(buffer)
            this.readKey(buffer)
            const length = buffer.readInt32()
            this.longArray = new Array(length)
            for(var i = 0;i < length;i++) this.longArray[i] = buffer.readInt64()
        }
        toJSON(): object {
            return {
                longArray: this.longArray
            }
        }
    }
    export function create(type: Type): NBTTag
    {
        switch(type)
        {
            case Type.End:
                return new NBTTag.End()
            case Type.Byte:
                return new NBTTag.Byte()
            case Type.Short:
                return new NBTTag.Short()
            case Type.Int:
                return new NBTTag.Int()
            case Type.Long:
                return new NBTTag.Long()
            case Type.Float:
                return new NBTTag.Float()
            case Type.Double:
                return new NBTTag.Double()
            case Type.ByteArray:
                return new NBTTag.ByteArray()
            case Type.String:
                return new NBTTag.String()
            case Type.List:
                return new NBTTag.List(NaN)
            case Type.Compound:
                return new NBTTag.Compound()
            case Type.IntArray:
                return new NBTTag.IntArray()
            case Type.LongArray:
                return new NBTTag.LongArray()
        }
    }
    export function read(buffer: NBuffer)
    {
        const type = buffer.readInt8() as Type
        buffer.readOffset -= NBuffer.SizeOf.Int8
        if(type == Type.End) return create(type)
        else
        {
            const tag = NBTTag.create(type)
            tag.read(buffer)
            return tag
        }
    }
}

export default NBTTag