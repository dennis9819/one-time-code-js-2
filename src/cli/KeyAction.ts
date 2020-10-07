/**
 * Dennis Gunia (c) 2020
 *
 * CLI Key-Action CommandLineAction Implementation.
 *
 * @summary CLI Key-Action CommandLineAction Implementation.
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

import { CommandLineAction, CommandLineFlagParameter, CommandLineChoiceParameter, CommandLineStringParameter } from "@rushstack/ts-command-line";
import { MLLogic_Key } from "../logic/KeyLogic";

export class KeyAction extends CommandLineAction {
    private _generate!: CommandLineFlagParameter;
    private _pubkey!: CommandLineStringParameter;
    private _privkey!: CommandLineStringParameter;

   
    public constructor() {
        super({
            actionName: 'key',
            summary: 'Manage RSA Keypair',
            documentation: 'Manage RSA Keypair'
        });
    }
   
    protected onExecute(): Promise<void> { // abstract
        return new Promise<void>((resolve,reject) => {
            MLLogic_Key.generate(this._privkey.value,this._pubkey.value);
        })
    }
   
    protected onDefineParameters(): void { // abstract
        this._generate = this.defineFlagParameter({
            parameterLongName: '--generate',
            parameterShortName: '-g',
            description: 'Send to all recipients, regardless if mail was already sent. Overwrites safe with new codes.'
        });

        this._pubkey = this.defineStringParameter({
            parameterLongName: '--pubkey',
            parameterShortName: '-p',
            description: 'Specify the public key to use',
            required: true,
            argumentName: "PUBLICKEY"
        })
   
        this._privkey = this.defineStringParameter({
            parameterLongName: '--privkey',
            parameterShortName: '-r',
            description: 'Specify the private key to use',
            required: true,
            argumentName: "PRIVATEKEY"
        })
    }
}