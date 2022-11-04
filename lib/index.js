"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("@nodetf/buffer");
const node_zlib_1 = require("node:zlib");
class NBTTag {
    type;
    key;
    constructor(type) {
        this.type = type;
    }
    checkType(a) {
        const type = typeof a == "number" ? a : a.readInt8();
        if (this.type != type)
            throw new TypeError(`Wrong type! Is ${NBTTag.Type[type]}, should be ${NBTTag.Type[this.type]}!`);
    }
    readKey(buffer) {
        const length = buffer.readInt16();
        this.key = buffer.readString(length, "utf-8");
    }
    writeKey(buffer) {
        if (this.key == undefined)
            return;
        buffer.writeInt16(this.key.length);
        buffer.writeString(this.key);
    }
    read(buffer, includeKey = true) {
        this.checkType(buffer);
        if (includeKey)
            this.readKey(buffer);
        this.readContent(buffer);
    }
    write(buffer, includeKey = true) {
        buffer.writeInt8(this.type);
        if (includeKey)
            this.writeKey(buffer);
        this.writeContent(buffer);
    }
}
(function (NBTTag) {
    let Type;
    (function (Type) {
        Type[Type["End"] = 0] = "End";
        Type[Type["Byte"] = 1] = "Byte";
        Type[Type["Short"] = 2] = "Short";
        Type[Type["Int"] = 3] = "Int";
        Type[Type["Long"] = 4] = "Long";
        Type[Type["Float"] = 5] = "Float";
        Type[Type["Double"] = 6] = "Double";
        Type[Type["ByteArray"] = 7] = "ByteArray";
        Type[Type["String"] = 8] = "String";
        Type[Type["List"] = 9] = "List";
        Type[Type["Compound"] = 10] = "Compound";
        Type[Type["IntArray"] = 11] = "IntArray";
        Type[Type["LongArray"] = 12] = "LongArray";
    })(Type = NBTTag.Type || (NBTTag.Type = {}));
    let Compression;
    (function (Compression) {
        Compression[Compression["None"] = 10] = "None";
        Compression[Compression["GZip"] = 31] = "GZip";
        Compression[Compression["ZLib"] = 120] = "ZLib";
    })(Compression = NBTTag.Compression || (NBTTag.Compression = {}));
    function detectCompression(buffer) {
        const firstByte = buffer.readInt8(0);
        switch (firstByte) {
            case Compression.None:
                return Compression.None;
            case Compression.GZip:
                return Compression.GZip;
            case Compression.ZLib:
                return Compression.ZLib;
            default:
                throw new Error("Couldn't detect compression!");
        }
    }
    NBTTag.detectCompression = detectCompression;
    class End extends NBTTag {
        constructor() {
            super(Type.End);
        }
        readContent(buffer) {
        }
        writeContent(buffer) {
        }
        toJSON() {
            return {};
        }
    }
    NBTTag.End = End;
    class Byte extends NBTTag {
        byte;
        constructor(byte = 0) {
            super(Type.Byte);
            this.byte = byte;
        }
        writeContent(buffer) {
            buffer.writeInt8(this.byte);
        }
        readContent(buffer) {
            this.byte = buffer.readInt8();
        }
        toJSON() {
            return {
                byte: this.byte,
                key: this.key
            };
        }
    }
    NBTTag.Byte = Byte;
    class Short extends NBTTag {
        short;
        constructor(short = 0) {
            super(Type.Short);
            this.short = short;
        }
        writeContent(buffer) {
            buffer.writeInt16(this.short);
        }
        readContent(buffer) {
            this.short = buffer.readInt16();
        }
        toJSON() {
            return {
                short: this.short,
                key: this.key
            };
        }
    }
    NBTTag.Short = Short;
    class Int extends NBTTag {
        int;
        constructor(int = 0) {
            super(Type.Int);
            this.int = int;
        }
        writeContent(buffer) {
            buffer.writeInt32(this.int);
        }
        readContent(buffer) {
            this.int = buffer.readInt32();
        }
        toJSON() {
            return {
                int: this.int,
                key: this.key
            };
        }
    }
    NBTTag.Int = Int;
    class Long extends NBTTag {
        long;
        constructor(long = BigInt(0)) {
            super(Type.Long);
            this.long = long;
        }
        writeContent(buffer) {
            buffer.writeInt64(this.long);
        }
        readContent(buffer) {
            this.long = buffer.readInt64();
        }
        toJSON() {
            return {
                long: this.long,
                key: this.key
            };
        }
    }
    NBTTag.Long = Long;
    class Float extends NBTTag {
        float;
        constructor(float = 0.0) {
            super(Type.Float);
            this.float = float;
        }
        writeContent(buffer) {
            buffer.writeFloat(this.float);
        }
        readContent(buffer) {
            this.float = buffer.readFloat();
        }
        toJSON() {
            return {
                float: this.float,
                key: this.key
            };
        }
    }
    NBTTag.Float = Float;
    class Double extends NBTTag {
        double;
        constructor(double = 0.0) {
            super(Type.Double);
            this.double = double;
        }
        writeContent(buffer) {
            buffer.writeDouble(this.double);
        }
        readContent(buffer) {
            this.double = buffer.readDouble();
        }
        toJSON() {
            return {
                double: this.double,
                key: this.key
            };
        }
    }
    NBTTag.Double = Double;
    class ByteArray extends NBTTag {
        byteArray;
        constructor(...arr) {
            super(Type.ByteArray);
            this.byteArray = arr;
        }
        writeContent(buffer) {
            buffer.writeInt32(this.byteArray.length);
            buffer.writeArray(this.byteArray, buffer_1.default.SizeOf.Int8);
        }
        readContent(buffer) {
            const length = buffer.readInt32();
            this.byteArray = buffer.readArray(length, buffer_1.default.SizeOf.Int8);
        }
        toJSON() {
            return {
                byteArray: this.byteArray,
                key: this.key
            };
        }
    }
    NBTTag.ByteArray = ByteArray;
    class String extends NBTTag {
        string;
        constructor(string = "") {
            super(Type.String);
            this.string = string;
        }
        writeContent(buffer) {
            buffer.writeInt16(this.string.length);
            buffer.writeString(this.string, "utf-8");
        }
        readContent(buffer) {
            const length = buffer.readInt16();
            this.string = buffer.readString(length, "utf-8");
        }
        toJSON() {
            return {
                string: this.string,
                key: this.key
            };
        }
    }
    NBTTag.String = String;
    class List extends NBTTag {
        listType;
        list;
        constructor(type, ...arr) {
            super(Type.List);
            this.listType = type;
            this.list = arr;
        }
        writeContent(buffer) {
            buffer.writeInt32(this.list.length);
            for (const tag of this.list)
                tag.write(buffer, false);
            buffer.writeInt8(Type.End);
        }
        readContent(buffer) {
            this.list = [];
            const length = buffer.readInt32();
            for (var index = 0; index < length; index++) {
                const tag = NBTTag.create(this.listType);
                tag.read(buffer, false);
                this.list.push(tag);
            }
            buffer.readInt8();
        }
        toJSON() {
            return {
                listType: this.listType,
                tags: this.list.map((t) => t.toJSON()),
                key: this.key
            };
        }
    }
    NBTTag.List = List;
    class Compound extends NBTTag {
        map;
        constructor(map = new Map()) {
            super(Type.Compound);
            this.map = map;
        }
        writeContent(buffer) {
            for (const tag of this.map.values())
                tag.write(buffer);
            buffer.writeInt8(Type.End);
        }
        readContent(buffer) {
            this.map = new Map();
            try {
                while (true) {
                    const tag = NBTTag.readTag(buffer);
                    if (tag.type == Type.End)
                        break;
                    this.map.set(tag.key, tag);
                }
            }
            catch (e) {
            }
        }
        toJSON() {
            return {
                map: this.map,
                key: this.key
            };
        }
    }
    NBTTag.Compound = Compound;
    class IntArray extends NBTTag {
        intArray;
        constructor(...arr) {
            super(Type.IntArray);
            this.intArray = arr;
        }
        writeContent(buffer) {
            buffer.writeInt32(this.intArray.length);
            buffer.writeArray(this.intArray, buffer_1.default.SizeOf.Int32);
        }
        readContent(buffer) {
            const length = buffer.readInt32();
            this.intArray = buffer.readArray(length, buffer_1.default.SizeOf.Int32);
        }
        toJSON() {
            return {
                intArray: this.intArray,
                key: this.key
            };
        }
    }
    NBTTag.IntArray = IntArray;
    class LongArray extends NBTTag {
        longArray;
        constructor(...arr) {
            super(Type.ByteArray);
            this.longArray = arr;
        }
        writeContent(buffer) {
            buffer.writeInt32(this.longArray.length);
            for (var i = 0; i < this.longArray.length; i++)
                buffer.writeInt64(this.longArray[i]);
        }
        readContent(buffer) {
            const length = buffer.readInt32();
            this.longArray = new Array(length);
            for (var i = 0; i < length; i++)
                this.longArray[i] = buffer.readInt64();
        }
        toJSON() {
            return {
                longArray: this.longArray,
                key: this.key
            };
        }
    }
    NBTTag.LongArray = LongArray;
    function create(type) {
        switch (type) {
            case Type.End:
                return new NBTTag.End();
            case Type.Byte:
                return new NBTTag.Byte();
            case Type.Short:
                return new NBTTag.Short();
            case Type.Int:
                return new NBTTag.Int();
            case Type.Long:
                return new NBTTag.Long();
            case Type.Float:
                return new NBTTag.Float();
            case Type.Double:
                return new NBTTag.Double();
            case Type.ByteArray:
                return new NBTTag.ByteArray();
            case Type.String:
                return new NBTTag.String();
            case Type.List:
                return new NBTTag.List(NaN);
            case Type.Compound:
                return new NBTTag.Compound();
            case Type.IntArray:
                return new NBTTag.IntArray();
            case Type.LongArray:
                return new NBTTag.LongArray();
        }
    }
    NBTTag.create = create;
    function read(buffer) {
        const compression = detectCompression(buffer);
        switch (compression) {
            case Compression.None:
                return readNone(buffer);
            case Compression.GZip:
                return readGZip(buffer);
            case Compression.ZLib:
                return readZLib(buffer);
            default:
                throw new Error("Couldn't read NBTTag!");
        }
    }
    NBTTag.read = read;
    function readTag(buffer) {
        const type = buffer.readInt8();
        buffer.readOffset -= buffer_1.default.SizeOf.Int8;
        if (type == Type.End)
            return create(type);
        else {
            const tag = NBTTag.create(type);
            tag.readContent(buffer);
            return tag;
        }
    }
    NBTTag.readTag = readTag;
    function readNone(cbuffer) {
        return readTag(new buffer_1.default(cbuffer));
    }
    NBTTag.readNone = readNone;
    function readGZip(cbuffer) {
        return readNone((0, node_zlib_1.gunzipSync)(cbuffer));
    }
    NBTTag.readGZip = readGZip;
    function readZLib(cbuffer) {
        return readNone((0, node_zlib_1.deflateSync)(cbuffer));
    }
    NBTTag.readZLib = readZLib;
})(NBTTag || (NBTTag = {}));
exports.default = NBTTag;
//# sourceMappingURL=index.js.map