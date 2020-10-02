"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var nodemailer = __importStar(require("nodemailer"));
var cliProgress = __importStar(require("cli-progress"));
var shuffle_1 = require("./util/shuffle");
var token_1 = require("./util/token");
var Handlebars = __importStar(require("handlebars"));
var mailParser_1 = require("./mailParser");
function generateToken(config, dataSafe) {
    return new Promise(function (resolve, error) {
        mailParser_1.parseMails(config).then(function (res) {
            generateCodes(resolve, error, res, config, dataSafe);
        });
    });
}
exports.generateToken = generateToken;
function generateCodes(resolve, error, mailArray, config, dataSafe) {
    return __awaiter(this, void 0, void 0, function () {
        var pbar, position, codeArray, checkString, listString, i, code;
        return __generator(this, function (_a) {
            console.log("\nGenerating codes");
            pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            pbar.start(mailArray.length, 0, {
                speed: "N/A"
            });
            position = 0;
            codeArray = [];
            checkString = '';
            listString = '';
            for (i = 0; i < mailArray.length; i++) {
                code = '';
                do {
                    code = token_1.mkstring(4);
                } while ((config.force ? codeArray : __spreadArrays(codeArray, config.usedTokens)).includes(code));
                codeArray.push(code);
                checkString = checkString + "|" + code;
                listString = listString + "\n" + code;
                position++;
                pbar.update(position);
            }
            checkString = checkString.substr(1);
            listString = listString.substr(1);
            pbar.stop();
            try {
                if (!fs.existsSync(path.dirname(config.outFileMatch))) {
                    fs.mkdirSync(path.dirname(config.outFileMatch));
                }
                fs.writeFileSync(config.outFileMatch, checkString);
            }
            catch (err) {
                error(err);
            }
            sendMails(resolve, error, mailArray, codeArray, config, dataSafe);
            return [2];
        });
    });
}
function sendMails(resolve, error, mailArray, codeArray, config, dataSafe) {
    return __awaiter(this, void 0, void 0, function () {
        var mailserver, template, htmlSrc, pbar, position, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mailserver = nodemailer.createTransport(config.mail);
                    try {
                        htmlSrc = fs.readFileSync(config.htmlPath, "utf8");
                        template = Handlebars.compile(htmlSrc);
                    }
                    catch (error) {
                        console.error("Cannote read template file!");
                        error(error);
                    }
                    console.log("\nSending mails");
                    pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    pbar.start(mailArray.length, 0, {
                        speed: "N/A"
                    });
                    position = 0;
                    shuffle_1.shuffleArray(mailArray);
                    shuffle_1.shuffleArray(codeArray);
                    if (config.force) {
                        dataSafe.clearVault();
                    }
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < mailArray.length)) return [3, 4];
                    if (!config.dryrun) {
                        dataSafe.pushData({
                            name: mailArray[i].name,
                            mail: mailArray[i].mail,
                            code: codeArray[i]
                        });
                    }
                    return [4, send(mailArray[i].name, mailArray[i].mail, codeArray[i], template, mailserver, config)];
                case 2:
                    _a.sent();
                    position++;
                    pbar.update(position);
                    _a.label = 3;
                case 3:
                    i++;
                    return [3, 1];
                case 4:
                    pbar.stop();
                    shuffle_1.shuffleArray(mailArray);
                    shuffle_1.shuffleArray(codeArray);
                    shuffle_1.shuffleArray(mailArray);
                    shuffle_1.shuffleArray(codeArray);
                    resolve({
                        codes: config.force ? codeArray : (config.dryrun ? config.usedTokens : __spreadArrays(codeArray, config.usedTokens)),
                        mails: config.force ? mailArray : (config.dryrun ? config.usedMails : __spreadArrays(mailArray, config.usedMails))
                    });
                    return [2];
            }
        });
    });
}
function send(name, mail, code, template, mailserver, config) {
    return __awaiter(this, void 0, void 0, function () {
        var html, mailOptions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!config.dryrun) return [3, 2];
                    return [4, delay(100)];
                case 1:
                    _a.sent();
                    console.log("\n\u001B[36m -> dryrun: would send to " + mail + "\u001B[0m");
                    return [3, 6];
                case 2:
                    html = template({
                        "name": name,
                        "mail": mail,
                        "code": code
                    });
                    mailOptions = {
                        from: config.mailFrom + " <" + config.mail.auth.user + ">",
                        to: mail,
                        subject: "Dein Zugangscode zur BJR Wahl",
                        html: html
                    };
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4, mailserver.sendMail(mailOptions)];
                case 4:
                    _a.sent();
                    return [3, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log("Error sendign mail to " + mail + " : " + error_1);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
function delay(t, val) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(val);
        }, t);
    });
}
