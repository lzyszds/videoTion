import express from "express";

import swig from "swig";
import fs from "fs";
import axios from "axios";
import { Worker } from "worker_threads";
import { merge } from './merge'
import https from 'https'
import bodyParser from 'body-parser'
const getVideo = require("./getVideo");


const app = express();

app.set('views', './template');
//设置html模板渲染引擎
app.engine('html', swig.renderFile);
//设置渲染引擎为html
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: false }))
// 使用 body-parser 中间件来解析请求体
app.use(bodyParser.json()); // 解析 JSON 格式的请求体
app.use(bodyParser.urlencoded({ extended: true })); // 解析 URL 编码的请求体


app.get("/", (req, resp) => {
  resp.render('index', { title: '爬取视频' });
})

app.post("/test", async (req, res) => {
  console.log(`lzy  req:`, req.body)
  res.send('请求完成')
})

/**
 *  url:m3u8地址
 *  thread:下载线程数量
 *  headers:请求头
*/
app.post("/search", async (req, res) => {
  if (JSON.stringify(req.body) === '{}') return res.send('请求参数不能为空,找不到请求参数');
  let { url, thread, headers, name } = req.body;
  name = name.replaceAll(" ", '')
  headers = JSON.parse(headers)
  Object.assign(headers, {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
  })
  let downLoadPlan = 0, timer: any = null
  // 将其转换为数字
  // try {
  const videoName = url.split('/')[url.split('/').length - 1].split('.')[0]
  const urlPrefix = url.split('/').splice(0, url.split('/').length - 1).join('/') + '/'
  const { data: m3u8Data } = await axios(url, {
    method: 'get', headers, httpsAgent: new https.Agent({
      rejectUnauthorized: false  // 禁用 SSL 证书验证
    })
  }) as any
  const dataArr = m3u8Data.split('\n').filter((res: any) => res.indexOf(videoName) === 0)
  const countArr = splitArrayIntoEqualChunks(dataArr, thread)
  getVideo(countArr[0], 0, 0, urlPrefix, headers).then((result: any) => {
    console.log(`lzy  result,then:`, result)
  }).catch((e: any) => {
    console.log(e, 'catch');
  }).finally((res: any) => {
    downLoadPlan++
  })
  for (let i = 1; i < thread; i++) {
    const seprateThread = new Worker(__dirname + `/seprate/seprateThread${i}.js`);
    seprateThread.on("message", async () => {
      console.log((downLoadPlan++) + "/" + thread);
      //如果当前卡住在15个线程以后，等待5分钟后，
      //如果还是没有下载完毕，就合并，不管有没有下载完毕
      timer && clearTimeout(timer)
      timer = setTimeout(() => {
        if (downLoadPlan >= 15) {
          merge(name).then(resultext => {
            res.send('合体成功，但是有部分视频没有下载完全')
          })
          return
        }
      }, 5 * 60 * 1000)
      if (downLoadPlan >= thread) {
        merge(name).then(resultext => {
          timer && clearTimeout(timer)
          res.send(resultext)
        })
      }
    });
    seprateThread.postMessage({ urlData: countArr[i], i, headers, urlPrefix });
  }
})



app.listen(3000, () => {
  console.log("http://localhost:3000");
})

// 映射静态地址
app.use(express.static('public'));

function splitArrayIntoEqualChunks(array: string[], numberOfChunks: number) {
  const chunkSize = Math.ceil(array.length / numberOfChunks);
  const result = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }

  return result;
}





// // 封装递归方法
// const getVideo = async (url: string, i: number) => {
//   // 爬取数据
//   const resa = await superagent.get(url + `${i}.ts`)
//     .set({
//       "Origin": 'https://missav.com',
//       "Referer": 'https://missav.com/cn/pppd-985-uncensored-leak',
//       "Sec-Ch-Ua": '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
//       "Sec-Fetch-Mode": 'cors',
//       "Sec-Fetch-Site": 'cross-site',
//       "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.165',
//     })
//   console.log(`正在爬取第${i}个视频`);

//   //将视频流生成二进制数据
//   const buffer = Buffer.from(resa.body);
//   if (i === 0) {
//     //如果是第一个视频，就创建文件
//     fs.writeFile('video.ts', buffer, (err) => {
//       if (err) {
//         console.log(err);
//         throw err;
//       }
//       console.log("第一个视频写入成功");
//       if (i < 100) {
//         getVideo(url, ++i);
//       }
//     })
//   } else {
//     //如果不是第一个视频，就追加写入
//     fs.appendFile('video.ts', buffer, (err) => {
//       if (err) {
//         console.log(err);
//         throw err;
//       }
//       console.log(`第${i}个视频写入成功`);
//       if (i < 100) {
//         getVideo(url, ++i);
//       }
//     })
//   }
//   // if (i < 100) {
//   //   getVideo(url, ++i);
//   // }
// }

// const url = 'https://cdn152.akamai-content-network.com/bcdn_token=QoM4P7qAfiEYmCQVfbz7wwFLdaad6FmTR00aEQzslf4&expires=1689092860&token_path=%2F1811c2dc-541d-43e9-a941-5c0fa8400fa9%2F/1811c2dc-541d-43e9-a941-5c0fa8400fa9/842x480/video'
// getVideo(url, 0);
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
