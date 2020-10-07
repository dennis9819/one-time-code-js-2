/**
 * Dennis Gunia (c) 2020
 *
 * MailParser Implementation.
 * This File provides a vault for storing encrypted and unencrypted data. Each encrypted element will be encrypted before storing it in an array.
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

import * as fs from 'fs'
import { SVault } from "./vault";

/**
 * Namespace containing the code for Parsing the mail list.
 */
export namespace MLParser{
    /**
     * Interface containing properties of a single mail line
     */
    export interface MLItem{
        /** mail adress parsed form file */
        mail: string;
        /** name parsed form file */
        name: string;
    }
    
    /**
     * Encrypts and appends data to SecureVault.
     * Also writes data to transaction log using @function writeTransaction
     * @param config - Reference to config object.
     * This Function uses the following variables:
     *   inFileMail -> String reference to mail list
     *   force -> Boolean value. If true all mails are resent.
     *   usedMails -> Array of Strings. Specifies already served mail adresses.
     *   
     * @param dataSafe - Reference to safe object. This is needed for writing to the vault.log file
     * @return Returns an array of all parsed mail adresses as promise
     */
    export function parseMails(config: any, dataSafe: SVault.SecureVault) {
        return new Promise<MLItem[]>((resolve,reject) => {
            let mailArray: MLItem[] = [];
            let currSection: string = "global";
            let lineCounter: number = 0;
            let curCounter: number = 0;
    
    
            console.log(`Reading mails for section ${currSection}`)
            // read and process mail list
            let readline = require('readline'),
            instream = fs.createReadStream(config.inFileMail),
            outstream = new (require('stream'))(),
            rl = readline.createInterface(instream, outstream);
                
            rl.on('line', function (line:string) {
                lineCounter ++;
                if(line.startsWith('[')){
                    if(line.endsWith(']')){
                        console.log(`Read ${curCounter} adresses for section ${currSection}`)
                        curCounter = 0;
                        currSection=line.substring(1,line.length -1);
                        console.log(`Reading mails for section ${currSection}`)
                    }else{
                        console.error(`Error parsing section on line ${lineCounter}: Syntax Error. Missing closing bracket ]`)
                    }
                }else if (!line.startsWith('#')){
                    const ix = line.indexOf(";")
                    if (ix !== -1){
                        // check if already exist
                        dataSafe.writeTransaction(`reading mail ${line.substr(0,ix)} from category ${currSection}`);
                        if (config.force || config.usedMails.filter((el: MLItem) => el.mail == line.substr(0,ix)).length == 0){
                            // check for duplicate
                            if ( mailArray.filter((el: MLItem) => el.mail == line.substr(0,ix)).length == 0){
                                mailArray.push({
                                    mail: line.substr(0,ix),
                                    name: line.substr(ix + 1)
                                })
                                curCounter ++;
                            }else{
                                dataSafe.writeTransaction(` -> duplicate mail. Skipping`);
                                console.error(`Skipping ${line.substr(0,ix)}: Duplicate`)
                            }
                        }else{
                            dataSafe.writeTransaction(` -> already exists. Skipping`);
                            console.error(`Skipping ${line.substr(0,ix)}: Already sent`)
                        }
                    }else{
                        console.error(`Error parsing mail on line ${lineCounter}: Syntax Error. Missing ;`)
                    }
    
                } 
            });
            rl.on('close', function (line:string) {
                // next step
                console.log(`Read ${curCounter} adresses for section ${currSection}\n${mailArray.length} mails read!`)
                resolve(mailArray);
            });
    
        })
    }
        
}


