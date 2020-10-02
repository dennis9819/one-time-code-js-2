"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkstring = void 0;
function mkstring(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.mkstring = mkstring;
