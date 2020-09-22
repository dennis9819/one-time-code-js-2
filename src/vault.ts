import * as crypto from 'crypto'
import path from 'path';
import * as fs from 'fs'
import { generateKeyPair } from 'crypto';

export interface SecureVaultItem {
    d: string; // data
    k: string; // key
    iv: string; // init vector
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

    constructor (publicKey: string, privateKey?: string) {
        this.safe = {
            items: [],
            publicKey:  publicKey ?fs.readFileSync(path.resolve(publicKey)): undefined,
            privateKey: privateKey ? fs.readFileSync(path.resolve(privateKey)): undefined
        };
        this.privPath = publicKey ? path.resolve(publicKey): undefined,
        this.pubPath =  privateKey ? path.resolve(privateKey): undefined
    }

    async pushData(data: any): Promise<void>{
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
        
        this.safe.items.push({
            d: encrypted.toString('hex'),
            k: asym_encrypted.toString("base64"),
            iv: iv.toString('hex')
        })
    }

    async saveData(path: string): Promise<void>{
        fs.writeFileSync(path, JSON.stringify(this.safe.items)); 
    }

    async loadData(path: string): Promise<void>{
        this.safe.items = JSON.parse(fs.readFileSync(path, 'utf8'))
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

}