import express from "express";

import swig from "swig";
import fs from "fs";
import axios from "axios";
import { Worker } from "worker_threads";
import { merge } from './merge'
import https from 'https'
import bodyParser from 'body-parser'
import dayjs from 'dayjs'

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
  //将文件名中的空格去掉 ,特殊字符也去掉
  fs.readdirSync('./public/cover').forEach((file: any) => {
    const name = file.split('.')[0]
    //使用正则表达式去掉空格等特殊字符
    const reg = /[\s\[\]\(\)\{\}\+\*\.\?\！\|\\\/\:\;\~\`\!\@\#\$\%\^\&\=\,\<\>\"\'\·]/g
    const newName = name.replaceAll(reg, '').replaceAll(' ', '')
    fs.renameSync(`./public/cover/${file}`, `./public/cover/${newName}.jpg`)
  })

  //将文件名中的空格去掉 ,特殊字符也去掉
  fs.readdirSync('./public/videoDownload').forEach((file: any) => {
    const name = file.split('.')[0]
    //使用正则表达式去掉空格等特殊字符
    const reg = /[\s\[\]\(\)\{\}\+\*\.\?\！\|\\\/\:\;\~\`\!\@\#\$\%\^\&\=\,\<\>\"\'\·]/g
    const newName = name.replaceAll(reg, '').replaceAll(' ', '')
    fs.renameSync(`./public/videoDownload/${file}`, `./public/videoDownload/${newName}.mp4`)
  })


  const coverList = fs.readdirSync('./public/cover').map((file: any) => {
    const name = file.split('.')[0]
    const url = name.replaceAll(" ", '')
    const stat = fs.statSync('./public/videoDownload/' + file.replace('.jpg', '.mp4'))
    let datails: { time: string, size: string } = {
      time: dayjs(stat.birthtimeMs).format("YYYY-MM-DD HH:mm"),
      size: formatFileSize(stat.size),
    }
    return {
      stampTime: stat.birthtimeMs,
      name: name,
      img: `http://localhost:3000/cover/${file}`,
      url: `http://localhost:3000/videoDownload/${url}.mp4`,
      datails
    }
  })

  resp.render('index', {
    coverlist: quickSortByTimestamp(coverList, 'stampTime', false)
  });
})
app.get('/python', (req, res) => {
  res.render('python')
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
  // <img src="https://img.supjav.com/images/2022/08/ssis498pl.jpg" class="img" alt="[无码破解]SSIS-498">
  //匹配双引号里面的内容
  const regex = /"(.*?)"/g;
  const matches = name.match(regex);
  let contents = null
  if (matches && matches.length > 0) {
    contents = matches.map((match: any) => match.replace(/"/g, ''));
    console.log(contents);
  } else {
    console.log("未找到双引号内容");
  }
  const coverImgUrl = contents[0]
  name = contents[2].replaceAll(" ", '').replaceAll("[无码破解]", '')
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
  getCoverImg(coverImgUrl, name)
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
      }, 2 * 60 * 1000)
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

function getCoverImg(coverImgUrl: string, name: string) {
  https.get(coverImgUrl, (response) => {
    const localPath = './public/cover/' + name + '.jpg'
    const fileStream = fs.createWriteStream(localPath);
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('图片下载完成');
    });
  }).on('error', (error) => {
    console.error('下载出错:', error);
  });
}

export function formatFileSize(fileSize: any) {

  const units = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB'
  ];
  let index = 0;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  return fileSize.toFixed(2) + units[index];
}

//排序
function quickSortByTimestamp(arr: any, key: string, isIncremental: boolean = true): any {
  if (arr.length <= 1) {
    return arr;
  }

  const pivot = arr[Math.floor(arr.length / 2)];
  const less = [];
  const equal = [];
  const greater = [];

  for (const element of arr) {
    if (element[key] < pivot[key]) {
      less.push(element);
    } else if (element[key] > pivot[key]) {
      greater.push(element);
    } else {
      equal.push(element);
    }
  }
  if (isIncremental) {
    return [...quickSortByTimestamp(less, key, isIncremental), ...equal, ...quickSortByTimestamp(greater, key, isIncremental)];
  } else {
    return [...quickSortByTimestamp(greater, key, isIncremental), ...equal, ...quickSortByTimestamp(less, key, isIncremental)];
  }
}
