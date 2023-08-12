
const { parentPort } = require("worker_threads");
const getVideo = require("../getVideo");
parentPort.on("message", (limit) => {
  const { urlData, i, urlPrefix, headers } = limit;
  getVideo(urlData, 0, i, urlPrefix, headers).then(res => {
    console.log(`lzy  res:`, res)
    parentPort.postMessage(res)
  });

});

