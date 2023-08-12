import fs from "fs";
import path from "path";
import child_process from "child_process";
merge('MIDV-234即使处于已经高潮了别动的状态新的-新有菜(桥本有菜)')
export async function merge(name: any) {
  let filenames = "0.ts";
  for (let i = 1; i < 20; i++) {
    filenames += `|${i}.ts`
  }

  name = name || 'PRED-356美丽的奶嘴生产中出精液里面看著相机楪可怜'
  // const name = 'PPPD-985与隔壁不友善的丰满妹妹长达一周的傲娇同居生活-楪可怜'

  console.log("开始合成-----");
  const cmd = `cd ./download && ffmpeg -i "concat:${filenames}" -c copy -bsf:a aac_adtstoasc -movflags +faststart ${name || new Date().getTime().toString()}.mp4`
  child_process.exec(cmd, {
    // 一次性最大缓存 不限制
    maxBuffer: 1024 * 1024 * 1024,
  }, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("合成成功");
    // 删除文件
    for (let i = 0; i < 20; i++) {
      fs.unlinkSync(__dirname + `/download/${i}.ts`);
    }

  });
  return '合成成功'
}
