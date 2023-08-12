const { parentPort } = require("worker_threads");

const getVideo = require("../getVideo");

// 获取文件夹下的所有文件的数量
function getFilesNum(path) {
  const fs = require("fs");
  const files = fs.readdirSync(path);
  return files.length;
}

parentPort.on("message", (limit) => {
  const { url, i, max } = limit;
  const limt = getFilesNum("./seprate");
  console.log(limt);
  const start = max / limt * i;
  const end = max / limt * (i + 1);

  getVideo(url, start, end);
});
