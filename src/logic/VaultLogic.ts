/**
 * Dennis Gunia (c) 2020
 *
 * CLI Vault-Action Implementation.
 *
 * @summary CLI Vault-Action Implementation.
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

import { SVault } from "../vault";
import * as util from 'util'
import { exit } from "process";

/**
 * Namespace containing the code for the Vault CLI Command.
 */
export namespace MLLogic_Vault {
    export async function open(
        _filter: string = '',
        _pubkey: string = '',
        _privkey: string = '',
        _safe: string = '',
        _getCodes: boolean,
        _format: string = '',
        _revoke: string | undefined,
    ){
        let dataSafe: SVault.SecureVault = new SVault.SecureVault(_pubkey,_privkey);
        dataSafe.loadData(_safe);
        const vault: SVault.SecureVaultItem[] = await dataSafe.decryptData();
        
        if (_revoke){
            revokeToken(dataSafe,_revoke,_safe)
        }else if(_getCodes){
            getCodes(dataSafe,_format);
        }else{
            printAsJSON(_filter,dataSafe,vault);
        }
    }

    function printAsJSON(_filter: string, dataSafe:SVault.SecureVault, vault: SVault.SecureVaultItem[]){
        switch(_filter){
            case 'all':
                console.log(util.inspect({
                    encrypted: vault,
                    unencrypted: dataSafe.getAllStorage()
                }, {showHidden: false, depth: null,colors: true}))
                break;
            case 'encrypted':
                console.log(vault);
                break;
            case 'unencrypted':
                console.log(dataSafe.getAllStorage());
                break;
        }

    }

    function revokeToken(dataSafe:SVault.SecureVault, _revoke: string,_safe: string){
        const revListUUID:SVault.StorageItem[] = dataSafe.findStorage("revokeList");
        // if list exists, test if token already revoked
        let rev = [];
        if (revListUUID.length > 0){
            rev = dataSafe.getStorage(revListUUID[0].u)
            if(rev.includes(_revoke)){
                console.error("Token already revoked");
                exit(1)
            }
        }
        // test if token exists
        const used = dataSafe.getStorage(dataSafe.findStorage("usedTokens")[0].u)
        if(!used.includes(_revoke)){
            console.error("Token does not exist");
            exit(1)
        }
        
        // append to or create list
        if (revListUUID.length == 0){
            dataSafe.pushStorage("revokeList",[_revoke])
        }else{
            dataSafe.setStorage(revListUUID[0].u,[...rev,_revoke])
        }
        dataSafe.saveData(_safe)
    }

    function getCodes(dataSafe:SVault.SecureVault,_format: string){
        const used: string[] = dataSafe.getStorage(dataSafe.findStorage("usedTokens")[0].u)
        const revListUUID:SVault.StorageItem[] = dataSafe.findStorage("revokeList");
        // get revoke list if exists
        let rev: string[] = [];
        if (revListUUID.length > 0){
            rev = dataSafe.getStorage(revListUUID[0].u)
        }
        const vaildCodes = used.filter(el => !rev.includes(el));
        switch(_format){
            case 'json':
                console.log(vaildCodes)
                break;
            case 'regex':
                let checkString: string = '';
                vaildCodes.forEach(el => checkString = `${checkString}|${el}`)
                console.log(checkString.substr(1))
                break;
        }
    }
    
}