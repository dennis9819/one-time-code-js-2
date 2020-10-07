/**
 * Dennis Gunia (c) 2020
 *
 * SecureVault Class Implementation.
 * This Class provides a vault for storing encrypted and unencrypted data. Each encrypted element will be encrypted before storing it in an array.
 * Each element (encrypted or unencrypted) ist stored in an array with an unique identifier. 
 * Safes can be stored and loaded. Unencrypted data can be stored, retrieved and modified. Encrypted data can be stored and retrieved.
 * This class also implements an transaction function.
 *
 * @summary SecureVault Class Implementation
 * @author Dennis Gunia <info@dennisgunia.de>
 * @license Licensed under the Apache License, Version 2.0 (the "License").
 * 
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import * as crypto from 'crypto'
import * as uuid from 'uuid'
import path from 'path';
import * as fs from 'fs'
import { generateKeyPair } from 'crypto';

/**
 * Namespace containing the code for the SecureVault.
 */
export namespace SVault {
    /** vault version number. This variable will be added to the safe file and is used to chack compatibility. */
    const vaultVersion = 'v1.2'

    /** Interface for an vault item containing encrypted data */
    export interface SecureVaultItem {
        /** uuid */ 
        u: string; 
        /** data */ 
        d: string; 
        /** key */ 
        k: string; 
        /** init vector */ 
        iv: string; 
    }

    /** Interface for an vault item containing unencrypted data */
    export interface StorageItem {
        /** uuid */ 
        u: string; 
        /** data */ 
        d: string; 
        /** tag (can be used to find specific items) */ 
        t: string; 
    }

    /** Interface for secureVault Array */
    export interface secureVaultList {
        items: SecureVaultItem[]; /** Array of encrypted items */ 
        publicKey?: Buffer; /** Binary of public key */ 
        privateKey?: Buffer; /** Binary of private key */ 
    }

    /** Class representing a SecureVault. */
    export class SecureVault {
        /** Safe object */ 
        safe: secureVaultList; 
        /** Path to private key */ 
        privPath?: string;
        /** Path to public key */ 
        pubPath?: string;
        /** Array of unencrypted items */ 
        storage: StorageItem[];

        /**
         * Create a SecureVault.
         * @param publicKey - Path to public key.
         * @param privateKey - Path to private key.
         */
        constructor (publicKey?: string, privateKey?: string) {
            this.storage = [];
            this.safe = {
                items: [],
                publicKey:  publicKey ?fs.readFileSync(path.resolve(publicKey)): undefined,
                privateKey: privateKey ? fs.readFileSync(path.resolve(privateKey)): undefined
            };
            this.privPath = publicKey ? path.resolve(publicKey): undefined,
            this.pubPath =  privateKey ? path.resolve(privateKey): undefined
        }

        /**
         * Encrypts and appends data to SecureVault.
         * Also writes data to transaction log using @function writeTransaction
         * @param data - Path to public key.
         * @return Returns the uuid of the added object as promise
         */
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

            const item = {
                u,
                d: encrypted.toString('hex'),
                k: asym_encrypted.toString("base64"),
                iv: iv.toString('hex')
            }
            this.writeTransaction("push: " + JSON.stringify(item))
            this.safe.items.push(item)
            return u;
        }

        /**
         * Writes data to the vault log file located at ./vault.log
         * @param payload - Text to append
         */
        writeTransaction(payload: string){
            fs.appendFileSync('vault.log', `${payload}\n`);
        }

        /**
         * Saves safe to file
         * @param path - Path to safefile.
         * @return Resolves promise after loaded
         */
        async saveData(path: string): Promise<void>{
            fs.writeFileSync(path, JSON.stringify({
                version: vaultVersion,
                vault: this.safe.items,
                storage: this.storage
            })); 
        }

        /**
         * Loads safe from file and check compatibility
         * @param path - Path to safefile.
         * @return Resolves promise after loaded
         */
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

        /**
         * Decrypts safe data.
         * Requires specified and loaded private key.
         * Prints data to console.
         * @return Resolves promise after decrypted
         */
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
        /**
         * Generates RSA keypair.
         * @param publicKey - Path to public key.
         * @param privateKey - Path to private key.
         */
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

        /**
         * Appends unencrypted data to safe.
         * @param tag - Tag for item
         * @param data - Data to store.
         */
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

        /**
         * Sets unencrypted data for item specified by suuid.
         * @param suuid - UUID for item
         * @param data - Data to store.
         */
        setStorage(suuid:string, data: any){
            if (vaultVersion !== 'v1.2'){
                throw new Error(`Storage not supported in ${vaultVersion}`);
            }else{
                let objJsonStr = JSON.stringify(data);
                let objJsonB64 = Buffer.from(objJsonStr,"utf8").toString("base64");
                this.storage.filter(el => el.u == suuid)[0].d = objJsonB64;
            }
        }

        /**
         * Gets unencrypted data of item specified by suuid.
         * @param suuid - UUID for item
         * @return Data from item.
         */
        getStorage(suuid:string){
            if (vaultVersion !== 'v1.2'){
                throw new Error(`Storage not supported in ${vaultVersion}`);
            }else{
                const data = this.storage.filter(el => el.u == suuid)[0];
                let objJsonB64 = new Buffer(data.d, 'base64');
                return JSON.parse(objJsonB64.toString('utf8'));
            }
        }

        /**
         * Gets list of UUIDs matching the tag.
         * @param tag - tag to search for
         * @return UUID from item.
         */
        findStorage(tag:string){
            if (vaultVersion !== 'v1.2'){
                throw new Error(`Storage not supported in ${vaultVersion}`);
            }else{
                return this.storage.filter(el => el.t == tag);
            }
        }

        /**
         * Clears all encrypted items from safe.
         */
        clearVault(){
            this.safe.items = [];
        }
    }
}
