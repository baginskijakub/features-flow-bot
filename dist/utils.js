"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPullRequest = exports.applyChanges = exports.findImpactedFiles = exports.findFilesWithFlags = void 0;
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
function findFilesWithFlags(directory, flags) {
    return __awaiter(this, void 0, void 0, function () {
        function searchDirectory(dir) {
            return __awaiter(this, void 0, void 0, function () {
                var entries, _loop_1, _i, entries_1, entry;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, promises_1.default.readdir(dir, { withFileTypes: true })];
                        case 1:
                            entries = _a.sent();
                            _loop_1 = function (entry) {
                                var fullPath, content_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            fullPath = path_1.default.join(dir, entry.name);
                                            if (!entry.isDirectory()) return [3 /*break*/, 2];
                                            return [4 /*yield*/, searchDirectory(fullPath)];
                                        case 1:
                                            _b.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            if (!(entry.isFile() && /\.(js|ts|jsx|tsx)$/.test(entry.name))) return [3 /*break*/, 4];
                                            return [4 /*yield*/, promises_1.default.readFile(fullPath, 'utf8')];
                                        case 3:
                                            content_1 = _b.sent();
                                            if (flags.some(function (flag) { return content_1.includes(flag); })) {
                                                filesToModify.push({ path: fullPath, content: content_1 });
                                            }
                                            _b.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, entries_1 = entries;
                            _a.label = 2;
                        case 2:
                            if (!(_i < entries_1.length)) return [3 /*break*/, 5];
                            entry = entries_1[_i];
                            return [5 /*yield**/, _loop_1(entry)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        var filesToModify;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filesToModify = [];
                    return [4 /*yield*/, searchDirectory(directory)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, filesToModify];
            }
        });
    });
}
exports.findFilesWithFlags = findFilesWithFlags;
function findImpactedFiles(filesToModify) {
    return __awaiter(this, void 0, void 0, function () {
        var impactedFiles, _i, filesToModify_1, file, content, importMatches, _a, importMatches_1, match, importPath, fullPath, isFileImpacted, _b, _c;
        var _d;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    impactedFiles = [];
                    _i = 0, filesToModify_1 = filesToModify;
                    _f.label = 1;
                case 1:
                    if (!(_i < filesToModify_1.length)) return [3 /*break*/, 8];
                    file = filesToModify_1[_i];
                    return [4 /*yield*/, promises_1.default.readFile(file.path, 'utf8')];
                case 2:
                    content = _f.sent();
                    importMatches = content.match(/import .* from ['"](.+)['"]/g) || [];
                    _a = 0, importMatches_1 = importMatches;
                    _f.label = 3;
                case 3:
                    if (!(_a < importMatches_1.length)) return [3 /*break*/, 7];
                    match = importMatches_1[_a];
                    importPath = (_e = match.match(/['"](.+)['"]/)) === null || _e === void 0 ? void 0 : _e[1];
                    if (!importPath) return [3 /*break*/, 6];
                    fullPath = path_1.default.resolve(path_1.default.dirname(file.path), importPath);
                    return [4 /*yield*/, promises_1.default.stat(fullPath).then(function () { return true; }).catch(function () { return false; })];
                case 4:
                    isFileImpacted = _f.sent();
                    if (!isFileImpacted) return [3 /*break*/, 6];
                    _c = (_b = impactedFiles).push;
                    _d = { path: fullPath };
                    return [4 /*yield*/, promises_1.default.readFile(fullPath, 'utf8')];
                case 5:
                    _c.apply(_b, [(_d.content = _f.sent(), _d)]);
                    _f.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 3];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, impactedFiles];
            }
        });
    });
}
exports.findImpactedFiles = findImpactedFiles;
function applyChanges(response) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, modifiedFiles, filesToDelete, _i, modifiedFiles_1, file, error_1, _b, filesToDelete_1, filePath, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (response.status === 'error') {
                        console.error(response.message);
                        return [2 /*return*/];
                    }
                    _a = response.data, modifiedFiles = _a.modifiedFiles, filesToDelete = _a.filesToDelete;
                    _i = 0, modifiedFiles_1 = modifiedFiles;
                    _c.label = 1;
                case 1:
                    if (!(_i < modifiedFiles_1.length)) return [3 /*break*/, 6];
                    file = modifiedFiles_1[_i];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, promises_1.default.writeFile(file.path, file.content, 'utf8')];
                case 3:
                    _c.sent();
                    console.log("Updated file: ".concat(file.path));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    console.error("Error writing to file ".concat(file.path, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    _b = 0, filesToDelete_1 = filesToDelete;
                    _c.label = 7;
                case 7:
                    if (!(_b < filesToDelete_1.length)) return [3 /*break*/, 12];
                    filePath = filesToDelete_1[_b];
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, promises_1.default.unlink(filePath)];
                case 9:
                    _c.sent();
                    console.log("Deleted file: ".concat(filePath));
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.error("Error deleting file ".concat(filePath, ":"), error_2);
                    return [3 /*break*/, 11];
                case 11:
                    _b++;
                    return [3 /*break*/, 7];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.applyChanges = applyChanges;
function createPullRequest(branchName) {
    return __awaiter(this, void 0, void 0, function () {
        var token, baseBranch, octokit, _a, owner, repo, pullRequest, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token = core.getInput('GITHUB_TOKEN', { required: true });
                    baseBranch = core.getInput('base_branch', { required: false }) || 'main';
                    octokit = github.getOctokit(token);
                    _a = github.context.repo, owner = _a.owner, repo = _a.repo;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, octokit.rest.pulls.create({
                            owner: owner,
                            repo: repo,
                            head: branchName,
                            base: baseBranch,
                            title: 'Remove Stale Feature Flags',
                            body: 'This PR removes stale feature flags and associated code. This is an automated PR created by the FeaturesFlow.',
                        })];
                case 2:
                    pullRequest = (_b.sent()).data;
                    console.log("Pull request created: ".concat(pullRequest.html_url));
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _b.sent();
                    console.error('Failed to create pull request:', error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.createPullRequest = createPullRequest;
