const superagent = require("superagent");
const fs = require("fs");
const ProgressBar = require("progress");

// 封装递归方法
/* 
  url:视频地址
  i:视频的索引
  index:当前线程的索引
  flag:是否显示进度条
*/
function getVideo(urlData, i, index, urlPrefix, headers) {
  return new Promise(async (resolve, reject) => {

    let resa
    try {
      resa = await superagent.get(urlPrefix + urlData[i]).set(headers);
      // var len = parseInt(resa.headers['content-length'], 10)
      // console.log(`正在爬取第${i}个视频`); //:etas 速度
      var bar = new ProgressBar(`🚅🚅🚅下载中|:bar| :percent :current/:total :elapsed  \n`, {
        complete: "»",
        incomplete: " ",
        width: 20,
        total: parseInt(urlData.length)
      });
      bar.tick(i);
      // 获取文件夹的存储大小
      // 将视频流生成二进制数据
      const buffer = Buffer.from(resa.body);
      // 将二进制数据写入文件
      // 判断当前文件夹中是否有该文件
      // 如果有就直接写入
      fs.appendFile(`./public/videoDownload/${index}.ts`, buffer, async (err) => {
        if (err) {
          reject(err); // 将错误传递给 Promise 的拒绝处理
          return;
        }
        if (i < urlData.length) {
          try {
            await getVideo(urlData, ++i, index, urlPrefix, headers);
          } catch (error) {
            reject(error); // 将错误传递给 Promise 的拒绝处理
          }
        } else { // 提示用户下载完成
          resolve('下载完成')
        }
      });
    } catch (e) {
      reject('下载完成' + index + e)
      // console.log('superagent的问题|下载完成' + index,);
    }
  })
}
module.exports = getVideo;
