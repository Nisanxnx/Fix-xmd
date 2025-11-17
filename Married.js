module.exports.config = {
  name: "married",
  version: "3.1.2",
  role: 2,
  premium: false,
  usePrefix: true,
  author: "TANVIR",
  description: "married",
  category: "img",
  usages: "[@mention]",
  cooldowns: 5,
  guide: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onStart = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;

  const dirMaterial = resolve(__dirname, 'cache/canvas');
  const marriedPath = resolve(dirMaterial, 'married.png');

  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(marriedPath)) await downloadFile("https://i.imgur.com/iYBanCN.jpeg", marriedPath);
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];

  const __root = path.resolve(__dirname, "cache", "canvas");
  const templatePath = path.join(__root, "married.png");

  let baseImg = await jimp.read(templatePath);
  let pathImg = path.join(__root, `married_${one}_${two}.png`);

  const avatarOnePath = path.join(__root, `avt_${one}.png`);
  const avatarTwoPath = path.join(__root, `avt_${two}.png`);

  // Download avatars as binary
  const avatarOneBuffer = await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
  fs.writeFileSync(avatarOnePath, avatarOneBuffer.data);

  const avatarTwoBuffer = await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
  fs.writeFileSync(avatarTwoPath, avatarTwoBuffer.data);

  const circleOne = await jimp.read(await circle(avatarOnePath));
  const circleTwo = await jimp.read(await circle(avatarTwoPath));

  baseImg.composite(circleOne.resize(90, 90), 210, 70)
         .composite(circleTwo.resize(90, 90), 120, 90);

  const raw = await baseImg.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, raw);

  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

async function circle(imagePath) {
  const jimp = require("jimp");
  const image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {    
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  if (!mention[0]) return api.sendMessage("Please mention 1 person.", threadID, messageID);

  const one = senderID;
  const two = mention[0];

  try {
    const pathImg = await makeImage({ one, two });
    await api.sendMessage({
      body: "'●❯────────────────❮●\n         -♦𝗟𝗜𝗦𝗔-𝗕𝗢𝗧♦-         \n●❯────────────────❮●\n-🦋🌻•\n\n•— সুন্দরি না হক বিশ্বাসি হক জিবন সঙ্গি__❤‍🩹🫶🏻🥺\n\n-\n●❯────────────────❮●",
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);
  } catch (err) {
    console.error(err);
    api.sendMessage("Something went wrong while creating the image.", threadID, messageID);
  }
    }
