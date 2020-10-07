/**
 * Dennis Gunia (c) 2020
 *
 * CLI Send-Action Implementation.
 *
 * @summary CLI Send-Action Implementation.
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

import { OTGlobalConfig } from "../config.type";
import { MLGenerator } from "../generate";
import { SVault } from "../vault";
import * as fs from 'fs'

/**
 * Namespace containing the code for the Send CLI Command.
 */
export namespace MLLogic_Send {
    export function send(
        _force: boolean,
        _dryrun: boolean,
        _pubkey: string = '',
        _config: string = '',
        _safe: string = '',
        _template: string = '',
        _maillist: string = ''
    ){
        let dataSafe: SVault.SecureVault = new SVault.SecureVault(_pubkey);
        dataSafe.writeTransaction(`Started ...`);
        // load config 
        const confRaw = fs.readFileSync(_config, 'utf8')
        let config: OTGlobalConfig = JSON.parse(confRaw)
        let addition: boolean = false; // wenn nur weitere hinzugefügt werden

        // load safe if present
        if (fs.existsSync(_safe)){
            dataSafe.loadData(_safe);
            config.usedTokens = dataSafe.getStorage(dataSafe.findStorage("usedTokens")[0].u);
            config.usedMails = dataSafe.getStorage(dataSafe.findStorage("usedMails")[0].u);
            addition = true;
        }else{
            config.usedTokens = [];
            config.usedMails = [];
        }

        try {
            config.inFileMail = _maillist;
            config.htmlPath = _template;
            config.dryrun = _dryrun;
            config.force = _force;
        } catch (error) {
            console.error("Cannote read config file!")
            process.exit(100);
        }
        MLGenerator.generateToken(config,dataSafe).then(el =>  {
            if (addition){
                dataSafe.setStorage(dataSafe.findStorage("usedTokens")[0].u,el.codes)
                dataSafe.setStorage(dataSafe.findStorage("usedMails")[0].u,el.mails)
                dataSafe.saveData(_safe);
            }else{
                dataSafe.pushStorage('usedTokens',el.codes)
                dataSafe.pushStorage('usedMails',el.mails)
                dataSafe.saveData(_safe);
            }
            dataSafe.writeTransaction(`Process exited successfully`);
        }).catch(err => {
            dataSafe.writeTransaction(`Process exited with error ${err}`);
            console.error("error", err)
        })
    }
}