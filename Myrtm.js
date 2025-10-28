const os = require("os");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "system",
    aliases: ["nvcstats", "nvcrt", "monitor"],
    version: "3.0",
    author: "Nisan",
    category: "system",
    shortDescription: "Stylish system monitor with NVC theme",
  },

  onStart: async function ({ message, api, event, usersData, threadsData }) {
    try {
      // Register custom font
      const fontPath = path.join(__dirname, "NisanEnglish.ttf");
      if (fs.existsSync(fontPath)) {
        Canvas.registerFont(fontPath, { family: "NisanEnglish" });
      }

      // Backgrounds (random)
      const backgrounds = [
        "https://ibb.co.com/VyRw5yR.jpg",
        "https://ibb.co.com/JW5V4MGD.jpg",
        "https://ibb.co.com/RGnnWP8m.jpg",
      ];
      const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Load background
      const bg = await Canvas.loadImage(bgUrl);
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Glow effect
      ctx.shadowColor = "rgba(255, 0, 150, 0.8)";
      ctx.shadowBlur = 25;

      // Title text
      ctx.font = "50px NisanEnglish";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("NVC SYSTEM MONITOR", canvas.width / 2, 100);

      // Remove shadow for info text
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffb6ff";
      ctx.font = "28px NisanEnglish";

      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);
      const cpuUsage = os.loadavg();
      const cpuModel = os.cpus()[0].model;

      const info = [
        `🕒 Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        `💾 Memory Usage: ${memoryUsagePercentage}%`,
        `🧠 CPU: ${cpuModel}`,
        `⚙️ OS: ${os.platform()} | ${os.arch()}`,
        `📦 Node.js: ${process.version}`,
      ];

      info.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 180 + i * 50);
      });

      const buffer = canvas.toBuffer("image/png");
      const filePath = path.join(__dirname, "nvc_system.png");
      fs.writeFileSync(filePath, buffer);

      message.reply({
        body: "💫 System Monitor by NVC",
        attachment: fs.createReadStream(filePath),
      }, () => fs.unlinkSync(filePath));

    } catch (err) {
      console.error(err);
      message.reply("❌ System Monitor failed to load.");
    }
  },
};
