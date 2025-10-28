const os = require("os");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "system",
    aliases: ["nvcstats", "nvcrt", "monitor"],
    version: "3.3",
    author: "Nisan",
    category: "system",
    shortDescription: "Stylish system monitor (random canvas background)",
  },

  onStart: async function ({ message }) {
    try {
      // Canvas
      const width = 800;
      const height = 600;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ✅ Random gradient background
      const colors = [
        ["#ff9a9e", "#fad0c4"],
        ["#a18cd1", "#fbc2eb"],
        ["#f6d365", "#fda085"],
        ["#96fbc4", "#f9f586"],
        ["#cfd9df", "#e2ebf0"]
      ];
      const randomColors = colors[Math.floor(Math.random() * colors.length)];
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, randomColors[0]);
      gradient.addColorStop(1, randomColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // ✅ Add random circles for style
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          20 + Math.random() * 30,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2 + 0.05})`;
        ctx.fill();
      }

      // Title
      ctx.shadowColor = "rgba(255, 0, 150, 0.8)";
      ctx.shadowBlur = 25;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 50px Sans";
      ctx.fillText("NVC SYSTEM MONITOR", width / 2, 100);

      // Info text
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

      const info = [
        `🕒 Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        `💾 Memory Usage: ${memoryUsagePercentage}%`,
        `🧠 CPU: ${cpuModel}`,
        `⚙️ OS: ${os.platform()} | ${os.arch()}`,
        `📦 Node.js: ${process.version}`,
      ];

      info.forEach((line, i) => {
        ctx.fillText(line, width / 2, 180 + i * 50);
      });

      // Save and send image
      const buffer = canvas.toBuffer("image/png");
      const filePath = path.join(__dirname, "nvc_system.png");
      fs.writeFileSync(filePath, buffer);

      await message.reply({
        body: "💫 System Monitor by NVC",
        attachment: fs.createReadStream(filePath),
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("System Monitor Error:", err);
      message.reply("❌ System Monitor failed to load.\n⚠️ Something went wrong.");
    }
  },
};
