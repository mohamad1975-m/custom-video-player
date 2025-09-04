import { exec } from "child_process";
import path from "path";
import fs from "fs";

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  const outFile = path.join("/tmp", "video.mp4");

  // کلید و IV ثابت (اینجا embed می‌کنیم)
  const key = Buffer.from([227,105,133,61,247,102,250,68,225,237,15,246,19,245,99,189]);
  const keyFile = path.join("/tmp", "local.key");
  fs.writeFileSync(keyFile, key);

  const iv = "0x00000000000000000000000000000001";

  // ساخت m3u8 محلی روی سرور (برای سادگی، مستقیم هم میشه)
  const listFile = path.join("/tmp", "list.m3u8");
  fs.writeFileSync(listFile, `#EXTM3U
#EXT-X-KEY:METHOD=AES-128,URI="${keyFile}",IV=${iv}
#EXT-X-STREAM-INF:BANDWIDTH=800000
${url}
`);

  // اجرای ffmpeg روی سرور
  const cmd = `ffmpeg -allowed_extensions ALL -protocol_whitelist "file,http,https,tcp,tls,crypto" -i ${listFile} -c copy -bsf:a aac_adtstoasc ${outFile}`;

  await new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) reject(stderr);
      else resolve(stdout);
    });
  });

  // فرستادن فایل به کاربر
  const data = fs.readFileSync(outFile);
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
  res.send(data);
}
