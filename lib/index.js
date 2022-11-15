"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NBTTagCompound = exports.NBTTagList = exports.NBTTagString = exports.NBTTagDouble = exports.NBTTagFloat = exports.NBTTagLong = exports.NBTTagInt = exports.NBTTagShort = exports.NBTTagByte = exports.NBTTagEnd = void 0;
const buffer_1 = require("@nodetf/buffer");
function readString16(buffer) {
    const length = buffer.readUInt16();
    return String.fromCharCode(...buffer.readArray(length, buffer_1.default.SizeOf.Int8));
}
function writeString16(buffer, string) {
    buffer.writeUInt16(string.length);
    buffer.writeArray([...string].map((char) => char.charCodeAt(0)), buffer_1.default.SizeOf.Int8);
}
class NBTBase {
    #key;
    static readTag(stream) {
        var type = stream.readInt8();
        if (type == 0)
            return new NBTTagEnd();
        else {
            var nbt = this.createTagOfType(type);
            if (nbt == null)
                throw new Error();
            nbt.#key = readString16(stream);
            nbt.readContent(stream);
            return nbt;
        }
    }
    static writeTag(nbt, stream) {
        stream.writeInt8(nbt.getType());
        if (nbt.getType() == 0)
            return;
        writeString16(stream, nbt.getKey());
        nbt.writeContent(stream);
    }
    static createTagOfType(type) {
        switch (type) {
            case 0: // '\0'
                return new NBTTagEnd();
            case 1: // '\001'
                return new NBTTagByte();
            case 2: // '\002'
                return new NBTTagShort();
            case 3: // '\003'
                return new NBTTagInt();
            case 4: // '\004'
                return new NBTTagLong();
            case 5: // '\005'
                return new NBTTagFloat();
            case 6: // '\006'
                return new NBTTagDouble();
            case 7: // '\007'
                return new NBTTagByte.Array();
            case 8: // '\b'
                return new NBTTagString();
            case 9: // '\t'
                return new NBTTagList();
            case 10: // '\n'
                return new NBTTagCompound();
        }
        return null;
    }
    static getTagName(type) {
        switch (type) {
            case 0:
                return "TAG_End";
            case 1:
                return "TAG_Byte";
            case 2:
                return "TAG_Short";
            case 3:
                return "TAG_Int";
            case 4:
                return "TAG_Long";
            case 5:
                return "TAG_Float";
            case 6:
                return "TAG_Double";
            case 7:
                return "TAG_Byte_Array";
            case 8:
                return "TAG_String";
            case 9:
                return "TAG_List";
            case 10:
                return "TAG_Compound";
            default:
                return "UNKNOWN";
        }
    }
    constructor() {
        this.#key = null;
    }
    getKey() {
        return typeof this.#key == "string" ? this.#key : "";
    }
    setKey(s) {
        this.#key = s;
        return this;
    }
}
class NBTTagEnd extends NBTBase {
    value;
    readContent(stream) {
    }
    writeContent(stream) {
    }
    getType() {
        return 0;
    }
    toString() {
        return "END";
    }
}
exports.NBTTagEnd = NBTTagEnd;
class NBTTagByte extends NBTBase {
    value;
    constructor(value = 0) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeInt8(this.value);
    }
    readContent(stream) {
        this.value = stream.readInt8();
    }
    getType() {
        return 1;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagByte = NBTTagByte;
(function (NBTTagByte) {
    class Array extends NBTBase {
        value;
        constructor(value = []) {
            super();
            this.value = value;
        }
        writeContent(stream) {
            stream.writeInt32(this.value.length);
            stream.writeArray(this.value, buffer_1.default.SizeOf.Int8);
        }
        readContent(stream) {
            var size = stream.readInt32();
            this.value = stream.readArray(size, buffer_1.default.SizeOf.Int8);
        }
        getType() {
            return 7;
        }
        toString() {
            return `[${this.value.length} bytes]`;
        }
    }
    NBTTagByte.Array = Array;
})(NBTTagByte = exports.NBTTagByte || (exports.NBTTagByte = {}));
class NBTTagShort extends NBTBase {
    value;
    constructor(value = 0) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeInt16(this.value);
    }
    readContent(stream) {
        this.value = stream.readInt16();
    }
    getType() {
        return 2;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagShort = NBTTagShort;
class NBTTagInt extends NBTBase {
    value;
    constructor(value = 0) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeInt32(this.value);
    }
    readContent(stream) {
        this.value = stream.readInt32();
    }
    getType() {
        return 3;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagInt = NBTTagInt;
class NBTTagLong extends NBTBase {
    value;
    constructor(value = 0n) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeInt64(this.value);
    }
    readContent(stream) {
        this.value = stream.readInt64();
    }
    getType() {
        return 4;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagLong = NBTTagLong;
class NBTTagFloat extends NBTBase {
    value;
    constructor(value = 0) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeFloat(this.value);
    }
    readContent(stream) {
        this.value = stream.readFloat();
    }
    getType() {
        return 5;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagFloat = NBTTagFloat;
class NBTTagDouble extends NBTBase {
    value;
    constructor(value = 0) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        stream.writeDouble(this.value);
    }
    readContent(stream) {
        this.value = stream.readDouble();
    }
    getType() {
        return 6;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagDouble = NBTTagDouble;
class NBTTagString extends NBTBase {
    value;
    constructor(value = String()) {
        super();
        this.value = value;
    }
    writeContent(stream) {
        writeString16(stream, this.value);
    }
    readContent(stream) {
        this.value = readString16(stream);
    }
    getType() {
        return 8;
    }
    toString() {
        return String(this.value);
    }
}
exports.NBTTagString = NBTTagString;
class NBTTagList extends NBTBase {
    type = 0;
    value;
    constructor() {
        super();
        this.value = [];
    }
    writeContent(stream) {
        if (this.value.length > 0)
            this.type = this.value[0].getType();
        else
            this.type = 1;
        stream.writeInt8(this.type);
        stream.writeInt32(this.value.length);
        for (const nbt of this.value)
            nbt.writeContent(stream);
    }
    readContent(stream) {
        this.type = stream.readInt8();
        var size = stream.readInt32();
        this.value = [];
        for (var i = 0; i < size; i++) {
            var nbt = NBTBase.createTagOfType(this.type);
            if (nbt == null)
                throw new Error();
            nbt.readContent(stream);
            this.value.push(nbt);
        }
    }
    getType() {
        return 9;
    }
    toString() {
        return `${this.value.length} entries of type ${NBTBase.getTagName(this.type)}`;
    }
}
exports.NBTTagList = NBTTagList;
class NBTTagCompound extends NBTBase {
    value;
    constructor() {
        super();
        this.value = new Map();
    }
    writeContent(stream) {
        for (const nbt of this.value.values())
            NBTBase.writeTag(nbt, stream);
        stream.writeInt8(0);
    }
    readContent(stream) {
        this.value.clear();
        for (var nbt; (nbt = NBTBase.readTag(stream)).getType() != 0; this.value.set(nbt.getKey(), nbt)) { }
    }
    getType() {
        return 10;
    }
    setTag(key, nbt) {
        this.value.set(key, nbt.setKey(key));
    }
    setByte(key, byte) {
        this.setTag(key, new NBTTagByte(byte));
    }
    setShort(key, short) {
        this.setTag(key, new NBTTagShort(short));
    }
    setInteger(key, int) {
        this.setTag(key, new NBTTagInt(int));
    }
    setLong(key, long) {
        this.setTag(key, new NBTTagLong(long));
    }
    setFloat(key, float) {
        this.setTag(key, new NBTTagFloat(float));
    }
    setDouble(key, double) {
        this.setTag(key, new NBTTagDouble(double));
    }
    setString(key, string) {
        this.setTag(key, new NBTTagString(string));
    }
    setByteArray(key, bytes) {
        this.setTag(key, new NBTTagByte.Array(bytes));
    }
    setCompoundTag(key, compound) {
        this.setTag(key, compound.setKey(key));
    }
    setBoolean(key, boolean) {
        this.setByte(key, boolean ? 1 : 0);
    }
    hasKey(key) {
        return this.value.has(key);
    }
    getByte(key) {
        if (!this.hasKey(key))
            return 0;
        return this.value.get(key).value;
    }
    getShort(key) {
        if (!this.hasKey(key))
            return 0;
        return this.value.get(key).value;
    }
    getInteger(key) {
        if (!this.hasKey(key))
            return 0;
        return this.value.get(key).value;
    }
    getLong(key) {
        if (!this.hasKey(key))
            return 0n;
        return this.value.get(key).value;
    }
    getFloat(key) {
        if (!this.hasKey(key))
            return 0;
        return this.value.get(key).value;
    }
    getDouble(key) {
        if (!this.hasKey(key))
            return 0;
        return this.value.get(key).value;
    }
    getString(key) {
        if (!this.hasKey(key))
            return "";
        return this.value.get(key).value;
    }
    getByteArray(key) {
        if (!this.hasKey(key))
            return [];
        return this.value.get(key).value;
    }
    getCompoundTag(key) {
        if (!this.hasKey(key))
            return new NBTTagCompound();
        return this.value.get(key);
    }
    getTagList(key) {
        if (!this.hasKey(key))
            return new NBTTagList();
        return this.value.get(key);
    }
    getBoolean(key) {
        return this.getByte(key) != 0;
    }
    toString() {
        return `${this.value.size} entries`;
    }
}
exports.NBTTagCompound = NBTTagCompound;
exports.default = NBTBase;
//# sourceMappingURL=index.js.map