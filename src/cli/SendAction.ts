/**
 * Dennis Gunia (c) 2020
 *
 * CLI Send-Action CommandLineAction Implementation.
 *
 * @summary CLI Send-Action CommandLineAction Implementation.
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
import { MLLogic_Send } from "../logic/SendLogic";

export class SendAction extends CommandLineAction {
    private _force!: CommandLineFlagParameter;
    private _dryrun!: CommandLineFlagParameter;
    private _pubkey!: CommandLineStringParameter;
    private _config!: CommandLineStringParameter;
    private _safe!: CommandLineStringParameter;
    private _template!: CommandLineStringParameter;
    private _maillist!: CommandLineStringParameter;
   
    public constructor() {
        super({
            actionName: 'send',
            summary: 'Generates codes, sends mails and stores results in safe',
            documentation: 'Generates codes, sends mails and stores results in safe'
        });
    }
   
    protected onExecute(): Promise<void> { // abstract
        return new Promise<void>((resolve,reject) => {
            MLLogic_Send.send(
                this._force.value,
                this._dryrun.value,
                this._pubkey.value,
                this._config.value,
                this._safe.value,
                this._template.value,
                this._maillist.value,
            );
        })
    }
   
    protected onDefineParameters(): void { // abstract
        this._force = this.defineFlagParameter({
            parameterLongName: '--force',
            parameterShortName: '-f',
            description: 'Send to all recipients, regardless if mail was already sent. Overwrites safe with new codes.'
        });

        this._dryrun = this.defineFlagParameter({
            parameterLongName: '--dryrun',
            parameterShortName: '-d',
            description: 'Pretend to send mails. No outgoing SMTP connection. Safe will not be updated.'
        });

        this._pubkey = this.defineStringParameter({
            parameterLongName: '--pubkey',
            parameterShortName: '-p',
            description: 'Specify the public key to use',
            required: true,
            argumentName: "PUBLICKEY"
        })
   
        this._config = this.defineStringParameter({
            parameterLongName: '--config',
            parameterShortName: '-c',
            description: 'Specify the config file to use',
            required: true,
            argumentName: "CONFIGFILE"
        })

        this._maillist = this.defineStringParameter({
            parameterLongName: '--mails',
            parameterShortName: '-m',
            description: 'Specify the maillist to use',
            required: true,
            argumentName: "MAILLIST"
        })

        this._safe = this.defineStringParameter({
            parameterLongName: '--safe',
            parameterShortName: '-s',
            description: 'Specify the safe file to use',
            required: true,
            argumentName: "SAFEFILE"
        })

        this._template = this.defineStringParameter({
            parameterLongName: '--template',
            parameterShortName: '-t',
            description: 'Specify the template file to use',
            required: true,
            argumentName: "HTMLFILE"
        })
    }
}