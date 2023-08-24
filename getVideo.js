const superagent = require("superagent");
const fs = require("fs");
const ProgressBar = require("progress");

// 封装递归方法
/* 
  url:视频地址
  i:视频的索引
  max:视频的总数
  index:当前线程的索引
  flag:是否显示进度条
*/
function getVideo(urlData, i, index, urlPrefix, headers) {
  return new Promise(async (resolve, reject) => {
    let resa
    try {
      resa = await superagent.get(urlPrefix + urlData[i]).set(headers);
      // console.log(`正在爬取第${i}个视频`);
      var bar = new ProgressBar("  downloading [:bar]  :percent :etas", {
        complete: "=",
        incomplete: " ",
        width: 20,
        total: urlData.length - 0
      });
      bar.tick(i);
      // 获取文件夹的存储大小
      // 将视频流生成二进制数据
      const buffer = Buffer.from(resa.body);
      // 将二进制数据写入文件
      // 判断当前文件夹中是否有该文件
      // 如果有就直接写入
      fs.appendFile(`./download/${index}.ts`, buffer, (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
        if (i < urlData.length) {
          getVideo(urlData, ++i, index, urlPrefix, headers);
        } else { // 提示用户下载完成
          console.log('\n' + '下载完成video' + index + '\n');
          resolve('下载完成')
        }
      });
    } catch (e) {
      console.log('superagent');
    }
  })
}

module.exports = getVideo;