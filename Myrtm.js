const os = require("os");
const Canvas = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "system",
    aliases: ["nvcstats", "nvcrt", "monitor"],
    version: "3.4",
    author: "Nisan",
    category: "system",
    shortDescription: "Animated system monitor with NVC style",
  },

  onStart: async function ({ message }) {
    try {
      const width = 800;
      const height = 600;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Gradient background
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

      // Floating circles
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

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffb6ff";
      ctx.font = "28px Sans";

      // Animated loading steps
      const steps = ["🖥 Initializing CPU...", "💾 Loading Memory...", "⚙️ Loading OS...", "📦 Loading Node.js...", "✅ Done!"];

      for (let i = 0; i < steps.length; i++) {
        ctx.clearRect(0, 500, width, 100); // Clear previous step
        ctx.fillText(steps[i], width / 2, 550);

        const buffer = canvas.toBuffer("image/png");
        const filePath = path.join(__dirname, `nvc_system_step.png`);
        fs.writeFileSync(filePath, buffer);

        // Send/update message with each step
        if (i === 0) {
          var sentMsg = await message.reply({
            body: steps[i],
            attachment: fs.createReadStream(filePath)
          });
        } else {
          await message.api.editMessage(steps[i], sentMsg.messageID);
        }

        fs.unlinkSync(filePath);
        await new Promise(r => setTimeout(r, 800)); // 0.8s delay per step
      }

      // Final system stats
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);
      const cpuModel = os.cpus()[0].model;

      const finalInfo = [
        `🕒 Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        `💾 Memory Usage: ${memoryUsagePercentage}%`,
        `🧠 CPU: ${cpuModel}`,
        `⚙️ OS: ${os.platform()} | ${os.arch()}`,
        `📦 Node.js: ${process.version}`
      ];

      // Draw final info
      ctx.clearRect(0, 180, width, 400); // Clear previous info
      finalInfo.forEach((line, i) => {
        ctx.fillText(line, width / 2, 200 + i * 50);
      });

      const finalBuffer = canvas.toBuffer("image/png");
      const finalPath = path.join(__dirname, "nvc_system_final.png");
      fs.writeFileSync(finalPath, finalBuffer);

      await message.api.editMessage("💫 System Monitor by NVC", sentMsg.messageID);
      await message.reply({
        body: "💫 System Monitor by NVC",
        attachment: fs.createReadStream(finalPath)
      });

      fs.unlinkSync(finalPath);

    } catch (err) {
      console.error("System Monitor Error:", err);
      message.reply("❌ System Monitor failed to load.\n⚠️ Something went wrong.");
    }
  },
};
