
const { parentPort } = require("worker_threads");
const getVideo = require("../getVideo");
parentPort.on("message", (limit) => {
  const { urlData, i, urlPrefix, headers } = limit;
  if (!urlPrefix || !urlData[i]) {
    return parentPort.postMessage({ msg: e, result: '下载完成' })
  }
  try {
    getVideo(urlData, 0, i, urlPrefix, headers)
      .then(res => {
        parentPort.postMessage(res)
      })
  } catch (e) {
    console.log(e);
  }
});
