// Standalone TTS script - reads raw text from stdin, outputs MP3 to stdout
const { EdgeTTS } = require("node-edge-tts");
const fs = require("fs");

const voice = process.argv[2] || "zh-CN-XiaoxiaoNeural";
if (!voice) { process.exit(1); }

const text = fs.readFileSync(0, "utf8").trim();
if (!text) { process.exit(1); }

(async () => {
  const tmpFile = require("os").tmpdir() + "\\tts-" + Date.now() + ".mp3";
  const tts = new EdgeTTS({
    voice,
    lang: "zh-CN",
    outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    rate: "+5%",
    pitch: "+5%",
    timeout: 30000,
  });
  await tts.ttsPromise(text, tmpFile);
  const buf = fs.readFileSync(tmpFile);
  process.stdout.write(buf);
  fs.unlinkSync(tmpFile);
  process.exit(0);
})().catch(() => process.exit(1));
