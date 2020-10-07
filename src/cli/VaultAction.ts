/**
 * Dennis Gunia (c) 2020
 *
 * CLI Vault-Action CommandLineAction Implementation.
 *
 * @summary CLI Vault-Action CommandLineAction Implementation.
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
import { MLLogic_Vault } from "../logic/VaultLogic";

export class  VaultAction extends CommandLineAction {
    private _filter!: CommandLineChoiceParameter;
    private _pubkey!: CommandLineStringParameter;
    private _privkey!: CommandLineStringParameter;
    private _safe!: CommandLineStringParameter;
    private _getCodes!: CommandLineFlagParameter;
    private _format!: CommandLineChoiceParameter;
    private _revoke!: CommandLineStringParameter;

    public constructor() {
        super({
            actionName: 'vault',
            summary: 'Manages Securevault file',
            documentation: 'Show user - token relations, filter and revoke token'
        });
    }
   
    protected onExecute(): Promise<void> { // abstract
        return new Promise<void>((resolve,reject) => {
            MLLogic_Vault.open(
                this._filter.value,
                this._pubkey.value,
                this._privkey.value,
                this._safe.value,
                this._getCodes.value,
                this._format.value,
                this._revoke.value
            )
        })
    }
   
    protected onDefineParameters(): void { // abstract
        this._filter = this.defineChoiceParameter({
            parameterLongName: '--filter',
            description: 'Specify the data to show',
            alternatives: ['encrypted', 'unencrypted', 'all'],
            environmentVariable: 'DATATYPE',
            defaultValue: 'all'
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

        this._safe = this.defineStringParameter({
            parameterLongName: '--safe',
            parameterShortName: '-s',
            description: 'Specify the safe file to use',
            required: true,
            argumentName: "SAFEFILE"
        })

        this._getCodes = this.defineFlagParameter({
            parameterLongName: '--get-codes',
            parameterShortName: '-g',
            description: 'Get a list of all non revoked codes'
        });

        this._format = this.defineChoiceParameter({
            parameterLongName: '--format',
            description: 'Specify the output format of --get-codes',
            alternatives: ['json', 'regex'],
            environmentVariable: 'FORMAT',
            defaultValue: 'json'
        });

        this._revoke = this.defineStringParameter({
            parameterLongName: '--revoke',
            description: 'Revokes a token',
            required: false,
            argumentName: "TOKEN"
        })
    }
}