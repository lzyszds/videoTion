import fs from "fs";
import path from "path";
import child_process from "child_process";
import notifier from 'node-notifier'
// merge('IPX-005リピーター続出！噂の本番できちゃうおっパブ店 Fカップ巨乳嬢を味わい尽くせ桃乃木かな')
export async function merge(name: any) {
  let filenames
  for (let i = 0; i < 20; i++) {
    const has = fs.existsSync(path.join(__dirname, `./public/videoDownload/${i}.ts`));
    if (has) {
      if (i === 0) {
        filenames = "0.ts"
      } else {
        filenames += `|${i}.ts`
      }
    }
  }
  if (filenames === undefined) return
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
    notifier.notify({
      title: 'av',
      message: '下载完成' + name
    });
    // 删除文件v
    for (let i = 0; i < 20; i++) {
      try {
        fs.unlinkSync(__dirname + `/public/videoDownload/${i}.ts`);
      }
      catch (e) {
        console.log();
      }
    }

  });
  return '合成成功'
}
