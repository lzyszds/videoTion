import fs from "fs";

let template = `

const { parentPort } = require("worker_threads");
const getVideo = require("../getVideo");
parentPort.on("message", (limit) => {
  const { urlData, i, urlPrefix, headers } = limit;
  if (!urlPrefix || !urlData[i]) {
    return parentPort.postMessage({ msg: '1', result: '下载完成' })
  }
  try {
    getVideo(urlData, 0, i, urlPrefix, headers)
      .then(res => {
      }).catch(e => {
      }).finally(() => {
        parentPort.postMessage(i)
      })
  } catch (e) {
    parentPort.postMessage(e)
  }
});
`
// 在文件夹seprate中创建多个文件，每个文件都是一个线程
for (let i = 1; i < 20; i++) {

  fs.writeFile(__dirname + `/seprate/seprateThread${i}.js`, template, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log(`seprateThread${i}.js创建成功`);
  })
}



