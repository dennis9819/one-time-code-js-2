"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureVault = void 0;
var crypto = __importStar(require("crypto"));
var uuid = __importStar(require("uuid"));
var path_1 = __importDefault(require("path"));
var fs = __importStar(require("fs"));
var crypto_1 = require("crypto");
var vaultVersion = 'v1.2';
var SecureVault = (function () {
    function SecureVault(publicKey, privateKey) {
        this.storage = [];
        this.safe = {
            items: [],
            publicKey: publicKey ? fs.readFileSync(path_1.default.resolve(publicKey)) : undefined,
            privateKey: privateKey ? fs.readFileSync(path_1.default.resolve(privateKey)) : undefined
        };
        this.privPath = publicKey ? path_1.default.resolve(publicKey) : undefined,
            this.pubPath = privateKey ? path_1.default.resolve(privateKey) : undefined;
    }
    SecureVault.prototype.pushData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var txtData, key, iv, cipher, encrypted, buffer, asym_encrypted, u;
            return __generator(this, function (_a) {
                txtData = JSON.stringify(data);
                key = crypto.randomBytes(32);
                iv = crypto.randomBytes(16);
                cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
                encrypted = cipher.update(txtData);
                encrypted = Buffer.concat([encrypted, cipher.final()]);
                buffer = new Buffer(key);
                if (!this.safe.publicKey) {
                    throw new Error("Public Key not found");
                }
                asym_encrypted = crypto.publicEncrypt(this.safe.publicKey, buffer);
                u = uuid.v4();
                this.safe.items.push({
                    u: u,
                    d: encrypted.toString('hex'),
                    k: asym_encrypted.toString("base64"),
                    iv: iv.toString('hex')
                });
                return [2, u];
            });
        });
    };
    SecureVault.prototype.saveData = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                fs.writeFileSync(path, JSON.stringify({
                    version: vaultVersion,
                    vault: this.safe.items,
                    storage: this.storage
                }));
                return [2];
            });
        });
    };
    SecureVault.prototype.loadData = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var loaded;
            return __generator(this, function (_a) {
                loaded = JSON.parse(fs.readFileSync(path, 'utf8'));
                switch (loaded.version) {
                    case 'v1.1':
                        this.safe.items = loaded.vault;
                        break;
                    case 'v1.2':
                        this.safe.items = loaded.vault;
                        this.storage = loaded.storage;
                        break;
                    default:
                        console.error("Unknown or unsupported vault file version: " + loaded.version);
                }
                return [2];
            });
        });
    };
    SecureVault.prototype.decryptData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.safe.items.forEach(function (el) {
                    var buffer = new Buffer(el.k, "base64");
                    if (!_this.safe.privateKey) {
                        throw new Error("Private Key not found");
                    }
                    var key = crypto.privateDecrypt(_this.safe.privateKey, buffer);
                    var iv = Buffer.from(el.iv, 'hex');
                    var encryptedText = Buffer.from(el.d, 'hex');
                    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    var decrypted = decipher.update(encryptedText);
                    decrypted = Buffer.concat([decrypted, decipher.final()]);
                    var obj = JSON.parse(decrypted.toString());
                    console.log(obj);
                });
                return [2];
            });
        });
    };
    SecureVault.genKey = function (publicKeyDir, privateKeyDir) {
        crypto_1.generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            }
        }, function (err, publicKey, privateKey) {
            fs.writeFileSync(privateKeyDir, privateKey);
            fs.writeFileSync(publicKeyDir, publicKey);
        });
    };
    SecureVault.prototype.pushStorage = function (tag, data) {
        if (vaultVersion !== 'v1.2') {
            throw new Error("Storage not supported in " + vaultVersion);
        }
        else {
            var objJsonStr = JSON.stringify(data);
            var objJsonB64 = Buffer.from(objJsonStr).toString("base64");
            this.storage.push({
                u: uuid.v4(),
                d: objJsonB64,
                t: tag
            });
        }
    };
    SecureVault.prototype.setStorage = function (suuid, data) {
        if (vaultVersion !== 'v1.2') {
            throw new Error("Storage not supported in " + vaultVersion);
        }
        else {
            var objJsonStr = JSON.stringify(data);
            var objJsonB64 = Buffer.from(objJsonStr, "utf8").toString("base64");
            this.storage.filter(function (el) { return el.u == suuid; })[0].d = objJsonB64;
        }
    };
    SecureVault.prototype.getStorage = function (suuid) {
        if (vaultVersion !== 'v1.2') {
            throw new Error("Storage not supported in " + vaultVersion);
        }
        else {
            var data = this.storage.filter(function (el) { return el.u == suuid; })[0];
            var objJsonB64 = new Buffer(data.d, 'base64');
            return JSON.parse(objJsonB64.toString('utf8'));
        }
    };
    SecureVault.prototype.findStorage = function (tag) {
        if (vaultVersion !== 'v1.2') {
            throw new Error("Storage not supported in " + vaultVersion);
        }
        else {
            return this.storage.filter(function (el) { return el.t == tag; });
        }
    };
    SecureVault.prototype.clearVault = function () {
        this.safe.items = [];
    };
    return SecureVault;
}());
exports.SecureVault = SecureVault;
