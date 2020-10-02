import * as crypto from 'crypto'
import * as uuid from 'uuid'
import path from 'path';
import * as fs from 'fs'
import { generateKeyPair } from 'crypto';
import { Console } from 'console';

const vaultVersion = 'v1.2'

export interface SecureVaultItem {
    u: string; // uuid
    d: string; // data
    k: string; // key
    iv: string; // init vector
}

export interface StorageItem {
    u: string; // uuid
    d: string; // data
    t: string; // tag
}

export interface secureVaultList {
    items: SecureVaultItem[];
    publicKey?: Buffer;
    privateKey?: Buffer;
}

export class SecureVault {
    
    safe: secureVaultList; 
    privPath?: string;
    pubPath?: string;
    storage: StorageItem[];

    constructor (publicKey: string, privateKey?: string) {
        this.storage = [];
        this.safe = {
            items: [],
            publicKey:  publicKey ?fs.readFileSync(path.resolve(publicKey)): undefined,
            privateKey: privateKey ? fs.readFileSync(path.resolve(privateKey)): undefined
        };
        this.privPath = publicKey ? path.resolve(publicKey): undefined,
        this.pubPath =  privateKey ? path.resolve(privateKey): undefined
    }

    async pushData(data: any): Promise<string>{
        // encrypt payload
        const txtData = JSON.stringify(data);
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(txtData);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // encrypt key
        var buffer = new Buffer(key);
        if (!this.safe.publicKey){
            throw new Error("Public Key not found");
        }
        var asym_encrypted = crypto.publicEncrypt(this.safe.publicKey, buffer);
        const u = uuid.v4()
        this.safe.items.push({
            u,
            d: encrypted.toString('hex'),
            k: asym_encrypted.toString("base64"),
            iv: iv.toString('hex')
        })
        return u;
    }

    async saveData(path: string): Promise<void>{
        fs.writeFileSync(path, JSON.stringify({
            version: vaultVersion,
            vault: this.safe.items,
            storage: this.storage
        })); 
    }

    async loadData(path: string): Promise<void>{
        const loaded = JSON.parse(fs.readFileSync(path, 'utf8'));
        switch (loaded.version){
            case 'v1.1':
                this.safe.items = loaded.vault;
                break;
            case 'v1.2':
                this.safe.items = loaded.vault;
                this.storage = loaded.storage;
                break;
            default:
                console.error(`Unknown or unsupported vault file version: ${loaded.version}`)
        }
        
    }

    async decryptData(): Promise<void>{
        
        this.safe.items.forEach(el => {
            // decrpyt key
            let buffer = new Buffer(el.k, "base64");
            if (!this.safe.privateKey){
                throw new Error("Private Key not found");
            }
            var key = crypto.privateDecrypt(this.safe.privateKey, buffer);
            // decrpyt payload
            let iv = Buffer.from(el.iv, 'hex');
            let encryptedText = Buffer.from(el.d, 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            const obj = JSON.parse(decrypted.toString());
            console.log(obj);
        })
    }

    static genKey(publicKeyDir: string, privateKeyDir: string){
        generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            }
        }, (err, publicKey, privateKey) => {
            fs.writeFileSync(privateKeyDir, privateKey); 
            fs.writeFileSync(publicKeyDir, publicKey); 
        });
    }

    pushStorage(tag:string, data: any){
        if (vaultVersion !== 'v1.2'){
            throw new Error(`Storage not supported in ${vaultVersion}`);
        }else{
            let objJsonStr = JSON.stringify(data);
            let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
            this.storage.push({
                u: uuid.v4(),
                d: objJsonB64,
                t: tag
            });
        }
    }

    setStorage(suuid:string, data: any){
        if (vaultVersion !== 'v1.2'){
            throw new Error(`Storage not supported in ${vaultVersion}`);
        }else{
            let objJsonStr = JSON.stringify(data);
            let objJsonB64 = Buffer.from(objJsonStr,"utf8").toString("base64");
            this.storage.filter(el => el.u == suuid)[0].d = objJsonB64;
        }
    }

    getStorage(suuid:string){
        if (vaultVersion !== 'v1.2'){
            throw new Error(`Storage not supported in ${vaultVersion}`);
        }else{
            const data = this.storage.filter(el => el.u == suuid)[0];
            let objJsonB64 = new Buffer(data.d, 'base64');
            return JSON.parse(objJsonB64.toString('utf8'));
        }
    }

    findStorage(tag:string){
        if (vaultVersion !== 'v1.2'){
            throw new Error(`Storage not supported in ${vaultVersion}`);
        }else{
            return this.storage.filter(el => el.t == tag);
        }
    }

    clearVault(){
        this.safe.items = [];
    }
}