import { CommandLineParser, CommandLineFlagParameter } from "@rushstack/ts-command-line";
/**
 * Dennis Gunia (c) 2020
 *
 * CommandLineAction Implementation.
 *
 * @summary CommandLineAction Implementation.
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

import { KeyAction } from "./KeyAction";
import { SendAction } from "./SendAction";
import { VaultAction } from "./VaultAction";

export class OpenTokenCLI extends CommandLineParser {
    private _verbose!: CommandLineFlagParameter;
   
    public constructor() {
      super({
        toolFilename: 'opentoken',
        toolDescription: 'The "opentoken" tool is to generate codes and deliver them to a list of recpipients without disclosing which user has which token.'
      });
   
      this.addAction(new SendAction());
      this.addAction(new VaultAction());
      this.addAction(new KeyAction());
    }
   
    protected onDefineParameters(): void { // abstract
      this._verbose = this.defineFlagParameter({
        parameterLongName: '--verbose',
        parameterShortName: '-v',
        description: 'Show extra logging detail'
      });
    }
   
    protected onExecute(): Promise<void> { // override
      
      return super.onExecute();
    }
  }