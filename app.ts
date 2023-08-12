import express from "express";

import swig from "swig";
import fs from "fs";
import axios from "axios";
import { Worker } from "worker_threads";
import { merge } from './merge'
import https from 'https'
const getVideo = require("./getVideo");


const app = express();

app.set('views', './template');
//设置html模板渲染引擎
app.engine('html', swig.renderFile);
//设置渲染引擎为html
app.set('view engine', 'html');
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, resp) => {
  resp.render('index', { title: '爬取视频' });
})


/**
 *  url:m3u8地址
 *  thread:下载线程数量
 *  headers:请求头
*/
app.post("/search", async (req, res) => {
  let { url, thread, headers, name } = req.body;
  name = name.replaceAll(" ", '')
  try {
    await merge(name)
  } catch {
    console.log('没有1');
  }
  headers = JSON.parse(headers)
  let downLoadPlan = 0
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
    console.log(`lzy  result:`, result)
    if (result === '下载完成') {
      downLoadPlan++
    }
    // merge()
  })
  for (let i = 1; i < 20; i++) {
    const seprateThread = new Worker(__dirname + `/seprate/seprateThread${i}.js`);
    seprateThread.on("message", (result) => {
      downLoadPlan++
      if (downLoadPlan >= thread) {
        console.log('下载完成');
        // merge()
      }
    });
    seprateThread.postMessage({ urlData: countArr[i], i, headers, urlPrefix });
  }
})


fs.readFile('./text.text', 'utf-8', (err, data) => {
  // const m3u8 = 'https://ss160.handonet.com/stream/3/AE/4x54iEqAa9faybfYIXxRHVq26qzHS8DXqyp/hls720/4x54iEqAa9faybfYIXxRHVq26qzHS8DXqyp720.m3u8'
  // const videoName = m3u8.split('/')[m3u8.split('/').length - 1].split('.')[0]
  // const dataArr = data.split('\n').filter((res) => res.indexOf(videoName) === 0)
  // console.log(`lzy  dataArr:`, dataArr)

})


app.listen(3000, () => {
  console.log("http://localhost:3000");
})

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
