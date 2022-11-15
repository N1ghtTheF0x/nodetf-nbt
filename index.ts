import NBuffer from "@nodetf/buffer";
import { deflateSync, gunzipSync } from "node:zlib"

function readString16(buffer: NBuffer)
{
    const length = buffer.readUInt16()
    return String.fromCharCode(...buffer.readArray(length,NBuffer.SizeOf.Int8))
}

function writeString16(buffer: NBuffer,string: string)
{
    buffer.writeUInt16(string.length)
    buffer.writeArray([...string].map((char) => char.charCodeAt(0)),NBuffer.SizeOf.Int8)
}

abstract class NBTBase
{
    #key: string | null
    abstract value: unknown
    static readTag(stream: NBuffer)
    {
        var type = stream.readInt8()
        if(type == 0) return new NBTTagEnd()
        else
        {
            var nbt = this.createTagOfType(type)
            if(nbt == null) throw new Error()
            nbt.#key = readString16(stream)
            nbt.readContent(stream)
            return nbt
        }
    }
    static writeTag(nbt: NBTBase,stream: NBuffer)
    {
        stream.writeInt8(nbt.getType())
        if(nbt.getType() == 0) return
        writeString16(stream,nbt.getKey())
        nbt.writeContent(stream)
    }
    static createTagOfType(type: number): NBTBase | null
    {
        switch(type)
        {
        case 0: // '\0'
            return new NBTTagEnd()

        case 1: // '\001'
            return new NBTTagByte()

        case 2: // '\002'
            return new NBTTagShort()

        case 3: // '\003'
            return new NBTTagInt()

        case 4: // '\004'
            return new NBTTagLong()

        case 5: // '\005'
            return new NBTTagFloat()

        case 6: // '\006'
            return new NBTTagDouble()

        case 7: // '\007'
            return new NBTTagByte.Array()

        case 8: // '\b'
            return new NBTTagString()

        case 9: // '\t'
            return new NBTTagList()

        case 10: // '\n'
            return new NBTTagCompound()
        }
        return null;
    }
    static getTagName(type: number)
    {
        switch(type)
        {
            case 0:
                return "TAG_End"
            case 1:
                return "TAG_Byte"
            case 2:
                return "TAG_Short"
            case 3:
                return "TAG_Int"
            case 4:
                return "TAG_Long"
            case 5:
                return "TAG_Float"
            case 6:
                return "TAG_Double"
            case 7:
                return "TAG_Byte_Array"
            case 8:
                return "TAG_String"
            case 9:
                return "TAG_List"
            case 10:
                return "TAG_Compound"
            default:
                return "UNKNOWN"
        }
    }
    constructor()
    {
        this.#key = null
    }
    abstract writeContent(stream: NBuffer): void
    abstract readContent(stream: NBuffer): void
    abstract getType(): number
    getKey()
    {
        return typeof this.#key == "string" ? this.#key : ""
    }
    setKey(s: string)
    {
        this.#key = s
        return this
    }
}

export class NBTTagEnd extends NBTBase
{
    value: undefined
    readContent(stream: NBuffer): void {
        
    }
    writeContent(stream: NBuffer): void {
        
    }
    getType(): number {
        return 0
    }
    toString()
    {
        return "END"
    }
}

export class NBTTagByte extends NBTBase
{
    value: number
    constructor(value: number = 0)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeInt8(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readInt8()
    }
    getType(): number {
        return 1
    }
    toString()
    {
        return String(this.value)
    }
}

export namespace NBTTagByte
{
    export class Array extends NBTBase
    {
        value: number[]
        constructor(value: number[] = [])
        {
            super()
            this.value = value
        }
        writeContent(stream: NBuffer): void {
            stream.writeInt32(this.value.length)
            stream.writeArray(this.value,NBuffer.SizeOf.Int8)
        }
        readContent(stream: NBuffer): void {
            var size = stream.readInt32()
            this.value = stream.readArray(size,NBuffer.SizeOf.Int8)
        }
        getType(): number {
            return 7
        }
        toString()
        {
            return `[${this.value.length} bytes]`
        }
    }
}

export class NBTTagShort extends NBTBase
{
    value: number
    constructor(value: number = 0)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeInt16(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readInt16()
    }
    getType(): number {
        return 2
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagInt extends NBTBase
{
    value: number
    constructor(value: number = 0)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeInt32(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readInt32()
    }
    getType(): number {
        return 3
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagLong extends NBTBase
{
    value: bigint
    constructor(value: bigint = 0n)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeInt64(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readInt64()
    }
    getType(): number {
        return 4
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagFloat extends NBTBase
{
    value: number
    constructor(value: number = 0)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeFloat(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readFloat()
    }
    getType(): number {
        return 5
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagDouble extends NBTBase
{
    value: number
    constructor(value: number = 0)
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        stream.writeDouble(this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = stream.readDouble()
    }
    getType(): number {
        return 6
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagString extends NBTBase
{
    value: string
    constructor(value: string = String())
    {
        super()
        this.value = value
    }
    writeContent(stream: NBuffer): void {
        writeString16(stream,this.value)
    }
    readContent(stream: NBuffer): void {
        this.value = readString16(stream)
    }
    getType(): number {
        return 8
    }
    toString()
    {
        return String(this.value)
    }
}

export class NBTTagList extends NBTBase
{
    type: number = 0
    value: NBTBase[]
    constructor()
    {
        super()
        this.value = []
    }
    writeContent(stream: NBuffer): void {
        if(this.value.length > 0) this.type = this.value[0].getType()
        else this.type = 1
        stream.writeInt8(this.type)
        stream.writeInt32(this.value.length)
        for(const nbt of this.value) nbt.writeContent(stream)
    }
    readContent(stream: NBuffer): void {
        this.type = stream.readInt8()
        var size = stream.readInt32()
        this.value = []
        for(var i = 0;i < size;i++)
        {
            var nbt = NBTBase.createTagOfType(this.type)
            if(nbt == null) throw new Error()
            nbt.readContent(stream)
            this.value.push(nbt)
        }
    }
    getType(): number {
        return 9
    }
    toString()
    {
        return `${this.value.length} entries of type ${NBTBase.getTagName(this.type)}`
    }
}

export class NBTTagCompound extends NBTBase
{
    value: Map<string,NBTBase>
    constructor()
    {
        super()
        this.value = new Map()
    }
    writeContent(stream: NBuffer): void {
        for(const nbt of this.value.values()) NBTBase.writeTag(nbt,stream)
        stream.writeInt8(0)
    }
    readContent(stream: NBuffer): void {
        this.value.clear()
        for(var nbt: NBTBase;(nbt = NBTBase.readTag(stream)).getType() != 0;this.value.set(nbt.getKey(),nbt)){}
    }
    getType(): number {
        return 10
    }
    setTag(key: string,nbt: NBTBase)
    {
        this.value.set(key,nbt.setKey(key))
    }
    setByte(key: string,byte: number)
    {
        this.setTag(key,new NBTTagByte(byte))
    }
    setShort(key: string,short: number)
    {
        this.setTag(key,new NBTTagShort(short))
    }
    setInteger(key: string,int: number)
    {
        this.setTag(key,new NBTTagInt(int))
    }
    setLong(key: string,long: bigint)
    {
        this.setTag(key,new NBTTagLong(long))
    }
    setFloat(key: string,float: number)
    {
        this.setTag(key,new NBTTagFloat(float))
    }
    setDouble(key: string,double: number)
    {
        this.setTag(key,new NBTTagDouble(double))
    }
    setString(key: string,string: string)
    {
        this.setTag(key,new NBTTagString(string))
    }
    setByteArray(key: string,bytes: number[])
    {
        this.setTag(key,new NBTTagByte.Array(bytes))
    }
    setCompoundTag(key: string,compound: NBTTagCompound)
    {
        this.setTag(key,compound.setKey(key))
    }
    setBoolean(key: string,boolean: boolean)
    {
        this.setByte(key,boolean ? 1 : 0)
    }
    hasKey(key: string)
    {
        return this.value.has(key)
    }
    getByte(key: string)
    {
        if(!this.hasKey(key)) return 0
        return (this.value.get(key) as NBTTagByte).value
    }
    getShort(key: string)
    {
        if(!this.hasKey(key)) return 0
        return (this.value.get(key) as NBTTagShort).value
    }
    getInteger(key: string)
    {
        if(!this.hasKey(key)) return 0
        return (this.value.get(key) as NBTTagInt).value
    }
    getLong(key: string)
    {
        if(!this.hasKey(key)) return 0n
        return (this.value.get(key) as NBTTagLong).value
    }
    getFloat(key: string)
    {
        if(!this.hasKey(key)) return 0
        return (this.value.get(key) as NBTTagFloat).value
    }
    getDouble(key: string)
    {
        if(!this.hasKey(key)) return 0
        return (this.value.get(key) as NBTTagDouble).value
    }
    getString(key: string)
    {
        if(!this.hasKey(key)) return ""
        return (this.value.get(key) as NBTTagString).value
    }
    getByteArray(key: string)
    {
        if(!this.hasKey(key)) return []
        return (this.value.get(key) as NBTTagByte.Array).value
    }
    getCompoundTag(key: string)
    {
        if(!this.hasKey(key)) return new NBTTagCompound()
        return (this.value.get(key) as NBTTagCompound)
    }
    getTagList(key: string)
    {
        if(!this.hasKey(key)) return new NBTTagList()
        return (this.value.get(key) as NBTTagList)
    }
    getBoolean(key: string)
    {
        return this.getByte(key) != 0
    }
    toString()
    {
        return `${this.value.size} entries`
    }
}

export default NBTBase