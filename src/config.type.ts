/**
 * Dennis Gunia (c) 2020
 *
 * Interface for global config object
 * 
 * @summary Open-Token entry point
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

import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { MLParser } from './mailParser';

/** Interface containing all config properties for opentoken */
export interface OTGlobalConfig {
    /** nodemailer SMTP configuration */
    mail: SMTPTransport,
    /** sender alias */
    mailFrom: string,
    /** path to file containing matches */
    outFileMatch: string
    /** path to file containing mails */
    inFileMail?: string
    /** path to file containing mail template */
    htmlPath?: string

    /** List of used tokens */
    usedTokens? : string[]
    /** List of used mail adresses */
    usedMails? : MLParser.MLItem[]

    /** switch for dryrun */
    dryrun: boolean
    /** switch for force */
    force: boolean
}