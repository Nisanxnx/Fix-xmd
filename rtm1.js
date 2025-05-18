const { GoatWrapper } = require("fca-liane-utils");
const os = require('os');
const { bold } = require("fontstyles");

module.exports = {
  config: {
    name: 'uptime',
    aliases: ['stats', 'status', 'system', 'rtm'],
    version: '1.5',
     usePrefix: false,
    author: 'Mahi--',
    countDown: 15,
    role: 0,
    shortDescription: 'Display bot uptime and system stats with media ban check',
    longDescription: {
      id: 'Display bot uptime and system stats with media ban check',
      en: 'Display bot uptime and system stats with media ban check'
    },
    category: 'system',
    guide: {
      id: '{pn}: Display bot uptime and system stats with media ban check',
      en: '{pn}: Display bot uptime and system stats with media ban check'
    }
  },
  onStart: async function ({ message, event, usersData, threadsData, api }) {
    // Anti-Author Change Check
    if (this.config.author !== 'Mahi--') {
      return message.reply("⚠ 𝗨𝗻𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗲𝗱 𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘁𝘆 𝗰𝗵𝗮𝗻𝗴𝗲 𝗱𝗲𝘁𝗲𝗰𝘁𝗲𝗱. 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗲𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻 𝘀𝘁𝗼𝗽𝗽𝗲𝗱.");
    }

    const startTime = Date.now();
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();

    try {
      // Uptime calculation
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // System Stats
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercentage = (usedMemory / totalMemory * 100).toFixed(2);

      const cpuUsage = os.loadavg();
      const cpuCores = os.cpus().length;
      const cpuModel = os.cpus()[0].model;
      const nodeVersion = process.version;
      const platform = os.platform();
      const networkInterfaces = os.networkInterfaces();

      const networkInfo = Object.keys(networkInterfaces).map(interface => {
        return {
          interface,
          addresses: networkInterfaces[interface].map(info => `${info.family}: ${info.address}`)
        };
      });

      const endTime = Date.now();
      const botPing = endTime - startTime;

      // Calculate total messages processed
      const totalMessages = users.reduce((sum, user) => sum + (user.messageCount || 0), 0);

      // Check media ban status
      const mediaBan = await threadsData.get(event.threadID, 'mediaBan') || false;
      const mediaBanStatus = mediaBan ? '🚫 𝙼𝚎𝚍𝚒𝚊 𝚒𝚜 𝚌𝚞𝚛𝚛𝚎𝚗𝚝𝚕𝚢 𝚋𝚊𝚗𝚗𝚎𝚍 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚌𝚑𝚊𝚝.' : '✅ 𝙼𝚎𝚍𝚒𝚊 𝚒𝚜 𝚗𝚘𝚝 𝚋𝚊𝚗𝚗𝚎𝚍 𝚒𝚗 𝚝𝚑𝚒𝚜 𝚌𝚑𝚊𝚝.';

      // Uptime-dependent response
      const uptimeResponse = uptime > 86400 ? "𝙸'𝚟𝚎 𝚋𝚎𝚎𝚗 𝚛𝚞𝚗𝚗𝚒𝚗𝚐 𝚏𝚘𝚛 𝚚𝚞𝚒𝚝𝚎 𝚊 𝚠𝚑𝚒𝚕𝚎 𝚗𝚘𝚠! 💪" : "𝙹𝚞𝚜𝚝 𝚐𝚎𝚝𝚝𝚒𝚗𝚐 𝚜𝚝𝚊𝚛𝚝𝚎𝚍! 😎";

      // Break the message content into 5 segments for 5 edits
      const editSegments = [
        `🖥 ${bold("System Statistics")}:\n• 𝐔𝐩𝐭𝐢𝐦𝐞: ${days}d ${hours}h ${minutes}m ${seconds}s\n• Memory Usage: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        `• 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐨𝐫𝐲: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} 𝐆𝐁\n• 𝐅𝐫𝐞𝐞 𝐌𝐞𝐦𝐨𝐫𝐲: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} 𝐆𝐁\n• 𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: ${memoryUsagePercentage}%\n• 𝐂𝐏𝐔 𝐔𝐬𝐚𝐠𝐞 (1m): ${cpuUsage[0].toFixed(2)}%`,
        `• 𝐂𝐏𝐔 𝐔𝐬𝐚𝐠𝐞 (5m): ${cpuUsage[1].toFixed(2)}%\n• 𝐂𝐏𝐔 𝐔𝐬𝐚𝐠𝐞 (15m): ${cpuUsage[2].toFixed(2)}%\n• 𝐂𝐏𝐔 𝐂𝐨𝐫𝐞𝐬: ${cpuCores}\n• 𝐂𝐏𝐔 𝐌𝐨𝐝𝐞𝐥: ${cpuModel}`,
        `• 𝐍𝐨𝐝𝐞.𝐣𝐬 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${nodeVersion}\n• 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n• 𝐏𝐢𝐧𝐠: ${botPing}ms\n• 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${users.length}\n• 𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${groups.length}`,
        `• 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐞𝐝: ${totalMessages}\n${mediaBanStatus}\n\n🌐 ${bold("Network Interfaces")}:\n${networkInfo.map(info => `• ${info.interface}: ${info.addresses.join(', ')}`).join('\n')}\n\n${uptimeResponse}`
      ];

      // Loading animation frames
      const loadingFrames = [
        '𝙻𝙾𝙰𝙳𝙸𝙽𝙶.\n[▬◡̈⃝︎▭▭▭▭]𝟏𝟎%',
        '𝙻𝙾𝙰𝙳𝙸𝙽𝙶..\n[▬▬◡̈⃝︎▭▭▭𝟑𝟎%]',
        '𝙻𝙾𝙰𝙳𝙸𝙽𝙶...\n[▬▬▬◡̈⃝︎▭▭𝟓𝟎%]',
        '𝙻𝙾𝙰𝙳𝙸𝙽𝙶...\n[▬▬▬▬◡̈⃝︎▭𝟖𝟎%]',
        '𝙻𝙾𝙰𝙳𝙴𝙳...\n[▬▬▬▬▬◡̈⃝︎]𝟏𝟎𝟎%'
      ];

      // Send the initial message
      let sentMessage = await message.reply("🖥 𝐈𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠 𝐬𝐲𝐬𝐭𝐞𝐦𝐬 𝐬𝐭𝐚𝐭𝐞...");

      // Function to edit the message up to 5 times
      const editMessageContent = (index) => {
        if (index < editSegments.length) {
          const loadingProgress = loadingFrames[index];
          const currentContent = `${loadingProgress}\n\n${editSegments.slice(0, index + 1).join('\n\n')}`;
          api.editMessage(currentContent, sentMessage.messageID);
          setTimeout(() => editMessageContent(index + 1), 600); // Fast animation with 600ms delay
        }
      };

      // Start editing the message
      editMessageContent(0);

    } catch (err) {
      console.error(err);
      return message.reply("❌ An error occurred while fetching system statistics.");
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
