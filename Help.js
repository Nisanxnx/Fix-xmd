const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const fancyFontMap = {
  'A': '𝙰','B': '𝙱','C': '𝙲','D': '𝙳','E': '𝙴','F': '𝙵','G': '𝙶','H': '𝙷','I': '𝙸','J': '𝙹','K': '𝙺','L': '𝙻','M': '𝙼','N': '𝙽','O': '𝙾','P': '𝙿','Q': '𝚀','R': '𝚁','S': '𝚂','T': '𝚃','U': '𝚄','V': '𝚅','W': '𝚆','X': '𝚇','Y': '𝚈','Z': '𝚉',
  'a': '𝚊','b': '𝚋','c': '𝚌','d': '𝚍','e': '𝚎','f': '𝚏','g': '𝚐','h': '𝚑','i': '𝚒','j': '𝚓','k': '𝚔','l': '𝚕','m': '𝚖','n': '𝚗','o': '𝚘','p': '𝚙','q': '𝚚','r': '𝚛','s': '𝚜','t': '𝚝','u': '𝚞','v': '𝚟','w': '𝚠','x': '𝚡','y': '𝚢','z': '𝚣',
  '0': '𝟶','1': '𝟷','2': '𝟸','3': '𝟹','4': '𝟺','5': '𝟻','6': '𝟼','7': '𝟽','8': '𝟾','9': '𝟿',
  ' ': ' ', ',': ',', '.': '.', '!': '!', '?': '?', '-': '-', '_': '_', '(': '(', ')': ')', '[': '[', ']': ']', '{': '{', '}': '}',
  '\n': '\n'
};

function toFancyFont(text) {
  return text.split('').map(c => fancyFontMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "A6y", 
    usePrefix: false,
    role: 0,
    category: "info",
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    const imageUrl = "https://i.imgur.com/8MaeBRw.jpeg";
    const imagePath = path.join(__dirname, "help.jpg");

    // Download image once if not cached
    if (!fs.existsSync(imagePath)) {
      try {
        const response = await axios({ url: imageUrl, method: "GET", responseType: "stream" });
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      } catch (err) {
        console.error("Failed to download help image:", err);
      }
    }

    if (args.length === 0) {
      // Group commands by category
      const categories = {};
      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      // Sort categories alphabetically
      const sortedCategories = Object.keys(categories).sort();
      let msg = toFancyFont(`𝙷𝙴𝙻𝙿 𝙻𝙸𝚂𝚃 𝙱𝚈 𝚇2:\n\n`);

      // Build message
      for (const category of sortedCategories) {
        msg += toFancyFont(`\n𝙲𝙰𝚃𝙴𝙶𝙾𝚁𝚈: ${category}\n`);
        const sortedCommands = categories[category].sort();
        for (let i = 0; i < sortedCommands.length; i += 3) {
          const cmds = sortedCommands.slice(i, i + 3).map(c => toFancyFont(c));
          msg += `│ ${cmds.join(" | ")}\n`;
        }
      }

      const totalCommands = commands.size;
      msg += toFancyFont(`\nTotal commands: ${totalCommands}\nType ${prefix}help <command> to view details.\n`);

      try {
        await message.reply({
          body: msg,
          attachment: fs.existsSync(imagePath) ? fs.createReadStream(imagePath) : undefined,
        });
      } catch (err) {
        console.error("Failed to send help message:", err);
        await message.reply(msg + "\n[Image unavailable]");
      }

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(toFancyFont(`Command "${commandName}" not found.`));
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = toFancyFont(`♕︎════════♔︎═════════♕︎
♕︎═══════𝙽𝙰𝙼𝙴════════♕︎
☕︎${configCommand.name}
☞︎︎︎𝚇2 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽 ☞︎︎︎${longDescription}
☞︎︎︎𝙾𝚃𝙷𝙴𝚁 𝙽𝙰𝙼𝙴 ☞︎︎︎${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}
☞︎︎︎𝙰𝚄𝚃𝙷𝙾𝚁 ☞︎︎︎${author}
☞︎︎︎𝚅𝙴𝚁𝚂𝙸𝙾𝙽 ☞︎︎︎${configCommand.version || "1.0"}
☞︎︎︎𝚁𝙾𝙻𝙴 ☞︎︎︎ ${roleText}
☞︎︎︎𝚄𝚂𝙰𝙶𝙴 ☞︎︎︎ ${usage}
♕︎════════♔︎═════════♕︎`);

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return toFancyFont("0 (All users)");
    case 1: return toFancyFont("1 (Group administrators)");
    case 2: return toFancyFont("2 (Admin bot)");
    default: return toFancyFont("Unknown role");
  }
}
