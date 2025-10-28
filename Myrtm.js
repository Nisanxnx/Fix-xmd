const os = require("os");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "system",
    aliases: ["nvcstats", "nvcrt", "monitor"],
    version: "3.1",
    author: "Nisan",
    category: "system",
    shortDescription: "Stylish system monitor (no font)",
  },

  onStart: async function ({ message }) {
    try {
      // ✅ Corrected working background links (direct images)
      const backgrounds = [
        "https://i.ibb.co/VyRw5yR.jpg",
        "https://i.ibb.co/JW5V4MGD.jpg",
        "https://i.ibb.co/RGnnWP8m.jpg"
      ];
      const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Load background image
      const bg = await Canvas.loadImage(bgUrl);
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      // Draw background
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Pink glow around title
      ctx.shadowColor = "rgba(255, 0, 150, 0.8)";
      ctx.shadowBlur = 25;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 50px Sans";
      ctx.fillText("NVC SYSTEM MONITOR", canvas.width / 2, 100);

      // Remove shadow for info text
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffb6ff";
      ctx.font = "28px Sans";

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

      // Info lines
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

      // Save and send image
      const buffer = canvas.toBuffer("image/png");
      const filePath = path.join(__dirname, "nvc_system.png");
      fs.writeFileSync(filePath, buffer);

      await message.reply({
        body: "💫 System Monitor by NVC",
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath); // delete temp file

    } catch (err) {
      console.error("System Monitor Error:", err);
      message.reply("❌ System Monitor failed to load.\nError logged in console.");
    }
  },
};
