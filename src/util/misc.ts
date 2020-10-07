/**
 * Dennis Gunia (c) 2020
 *
 * Reusable functions for different projects.
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


 

/** 
 * Generate random string with specified length.
 * Generates only numbers and capital letters.
 * @param length length of String
 * @return generated string
 */
export function mkstringCN (length:number ) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Wraps setTimeout into Promise
 * @param t Millisceonds
 */
export function delay(t: number) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, t);
    });
}