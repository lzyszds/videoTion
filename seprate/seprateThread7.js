

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
