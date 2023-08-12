"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var superagent_1 = require("superagent");
var fs_1 = require("fs");
var swig_1 = require("swig");
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.set('views', './template');
//设置html模板渲染引擎
app.engine('html', swig_1.default.renderFile);
//设置渲染引擎为html
app.set('view engine', 'html');
var sleep = function (delaytime) {
    if (delaytime === void 0) { delaytime = 1000; }
    return new Promise(function (resolve) { return setTimeout(resolve, delaytime); });
};
// 封装递归方法
var getVideo = function (url, i) { return __awaiter(void 0, void 0, void 0, function () {
    var resa, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, superagent_1.default.get(url + "".concat(i, ".ts"))
                    .set({
                    "Origin": 'https://missav.com',
                    "Referer": 'https://missav.com/cn/pppd-985-uncensored-leak',
                    "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
                    "Sec-Fetch-Mode": 'cors',
                    "Sec-Fetch-Site": 'cross-site',
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.165',
                })];
            case 1:
                resa = _a.sent();
                console.log("\u6B63\u5728\u722C\u53D6\u7B2C".concat(i, "\u4E2A\u89C6\u9891"));
                buffer = Buffer.from(resa.body);
                if (i === 0) {
                    //如果是第一个视频，就创建文件
                    fs_1.default.writeFile('video.ts', buffer, function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        console.log("第一个视频写入成功");
                        if (i < 100) {
                            getVideo(url, ++i);
                        }
                    });
                }
                else {
                    //如果不是第一个视频，就追加写入
                    fs_1.default.appendFile('video.ts', buffer, function (err) {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        console.log("\u7B2C".concat(i, "\u4E2A\u89C6\u9891\u5199\u5165\u6210\u529F"));
                        if (i < 100) {
                            getVideo(url, ++i);
                        }
                    });
                }
                return [2 /*return*/];
        }
    });
}); };
var url = 'https://cdn152.akamai-content-network.com/bcdn_token=QoM4P7qAfiEYmCQVfbz7wwFLdaad6FmTR00aEQzslf4&expires=1689092860&token_path=%2F1811c2dc-541d-43e9-a941-5c0fa8400fa9%2F/1811c2dc-541d-43e9-a941-5c0fa8400fa9/842x480/video';
getVideo(url, 0);
// superagent.get(url + `${i}.ts`)
//   .set({
//     "Origin": 'https://missav.com',
//     "Referer": 'https://missav.com/cn/pppd-985-uncensored-leak',
//     "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
//     "Sec-Fetch-Mode": 'cors',
//     "Sec-Fetch-Site": 'cross-site',
//     "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.165',
//   })
//   .end((err, res) => {
//     console.log(`正在爬取第${i}个视频`);
//     if (err) {
//       console.log(err);
//       throw err;
//     }
//     //将视频流生成二进制数据
//     const buffer = Buffer.from(res.body);
//     if (i === 0) {
//       //如果是第一个视频，就创建文件
//       fs.writeFile('video.ts', buffer, (err) => {
//         if (err) {
//           console.log(err);
//           throw err;
//         }
//         console.log("第一个视频写入成功");
//       })
//     } else {
//       //如果不是第一个视频，就追加写入
//       fs.appendFile('video.ts', buffer, (err) => {
//         if (err) {
//           console.log(err);
//           throw err;
//         }
//         console.log(`第${i}个视频写入成功`);
//       })
//     }
//     i++;
//     resp.send("爬取成功")
//   })
// app.get("/", (req, resp) => {
//   //渲染页面
//   // res.render("index.html");
//   const url = 'https://cdn152.akamai-content-network.com/bcdn_token=QoM4P7qAfiEYmCQVfbz7wwFLdaad6FmTR00aEQzslf4&expires=1689092860&token_path=%2F1811c2dc-541d-43e9-a941-5c0fa8400fa9%2F/1811c2dc-541d-43e9-a941-5c0fa8400fa9/842x480/video'
//   let i = 0;
//   console.log(url + `${i}.ts`);
//   getVideo(url, i);
//   // sleep(1000)
//   // 爬取数据
// })
// app.post("/search", (req, res) => {
//   // 获取表单数据
//   // console.log(req.body);
//   // const { url } = req.body;
//   const url = ' https://cdn152.akamai-content-network.com/bcdn_token=QoM4P7qAfiEYmCQVfbz7wwFLdaad6FmTR00aEQzslf4&expires=1689092860&token_path=%2F1811c2dc-541d-43e9-a941-5c0fa8400fa9%2F/1811c2dc-541d-43e9-a941-5c0fa8400fa9/842x480/video'
//   let i = 0;
//   //如果抛出异常，就停止爬取
//   try {
//   }
//   catch (err) {
//     console.log("爬取完毕");
//   }
// })
// app.listen(3000, () => {
//   console.log("http://localhost:3000");
// })
