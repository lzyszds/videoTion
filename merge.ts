import fs from "fs";
import path from "path";
import child_process from "child_process";
merge('MVSD-438問答無用の大量中出し20連発-晶エリー')
export async function merge(name: any) {
  //检测0.ts文件是否存在如果存在就合并
  let isExist = fs.existsSync(path.join(__dirname, `./public/videoDownload/0.ts`));
  if (!isExist) {
    return '文件不存在'
  }
  let filenames = "0.ts";
  for (let i = 1; i < 20; i++) {
    filenames += `|${i}.ts`
  }
  const max = {
    // 一次性最大缓存 不限制
    maxBuffer: 1024 * 1024 * 1024,
  }
  name = name || 'PRED-356美丽的奶嘴生产中出精液里面看著相机楪可怜'
  const cmd = `cd ./public/videoDownload && ffmpeg -i "concat:${filenames}" -c copy -bsf:a aac_adtstoasc -movflags +faststart ${name || new Date().getTime().toString()}.mp4`
  child_process.exec(cmd, max, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("合成成功");
    // 删除文件
    for (let i = 0; i < 20; i++) {
      fs.unlinkSync(__dirname + `/public/videoDownload/${i}.ts`);
    }

  });
  return '合成成功'
}
