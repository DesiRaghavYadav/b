import { serialize } from '../../lib/Serializer.js';
import fs from 'fs';
import path from 'path';
const antilinkSettings = {}; // In-memory database to store antilink settings for each chat


// Function to add a link to links.json
function addLink(link) {
    const filePath = path.join(process.cwd(), 'links.json'); // Use process.cwd() for absolute path
  
    // Step 1: Check if links.json exists, create it if not
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([])); // initialize with an empty array
    }
  
    // Step 2: Read the existing links from links.json
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
    // Step 3: Check if the link already exists in the file
    const linkExists = data.some(item => item.link === link);
    if (linkExists) {
      console.log('Link already exists in links.json');
      return;
    }
  
    // Step 4: Create a new entry with the next ID and add it to the array
    const newId = data.length ? data[data.length - 1].id + 1 : 1;
    const newLink = { id: newId, link: link };
    data.push(newLink);
  
    // Step 5: Save the updated list back to links.json
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Link added successfully to links.json');
  }



export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
    const PREFIX = /^[\\/!#.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
  
    
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === 'antilink') {
        const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
        const action = args[0] ? args[0].toLowerCase() : '';

        if (!m.isGroup) {
            await sock.sendMessage(m.from, { text: 'This command can only be used in groups.' }, { quoted: m });
            return;
        }

        // if (!isBotAdmins) {
        //     await sock.sendMessage(m.from, { text: 'The bot needs to be an admin to manage the antilink feature.' }, { quoted: m });
        //     return;
        // }

        if (action === 'on') {
            if (isAdmins) {
                antilinkSettings[m.from] = true;
                await sock.sendMessage(m.from, { text: 'Antilink feature has been enabled for this chat.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can enable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        if (action === 'off') {
            if (isAdmins) {
                antilinkSettings[m.from] = false;
                await sock.sendMessage(m.from, { text: 'Antilink feature has been disabled for this chat.' }, { quoted: m });
            } else {
                await sock.sendMessage(m.from, { text: 'Only admins can disable the antilink feature.' }, { quoted: m });
            }
            return;
        }

        await sock.sendMessage(m.from, { text: `Usage: ${prefix + cmd} on\n ${prefix + cmd} off` }, { quoted: m });
        return;
    }
    if (!antilinkSettings[m.from]) {
        if (m.body.match(/(chat.whatsapp.com\/)/gi)){
            // Example usage
          addLink(m.body); // Replace with the link you want to add
        }
    }
    // if (antilinkSettings[m.from]) {
    //     if (m.body.match(/(chat.whatsapp.com\/)/gi)) {
    //         if (!isBotAdmins) {
    //             await sock.sendMessage(m.from, { text: `The bot needs to be an admin to remove links.` });
    //             return;
    //         }
    //         let gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
    //         let isLinkThisGc = new RegExp(gclink, 'i');
    //         let isgclink = isLinkThisGc.test(m.body);
    //         if (isgclink) {
    //             await sock.sendMessage(m.from, { text: `The link you shared is for this group, so you won't be removed.` });
    //             return;
    //         }
    //         if (isAdmins) {
    //             await sock.sendMessage(m.from, { text: `Admins are allowed to share links.` });
    //             return;
    //         }
    //         if (isCreator) {
    //             await sock.sendMessage(m.from, { text: `The owner is allowed to share links.` });
    //             return;
    //         }



    //       // Example usage
    //       addLink(m.body); // Replace with the link you want to add

    //         // Send warning message first
    //         await sock.sendMessage(m.from, {
    //             text: `\`\`\`「 Group Link Detected ${m.body} 」\`\`\`\n\n@${m.sender.split("@")[0]}, please do not share group links in this group.`,
    //             contextInfo: { mentionedJid: [m.sender] }
    //         }, { quoted: m });

    //         // Delete the link message
    //         await sock.sendMessage(m.from, {
    //             delete: {
    //                 remoteJid: m.from,
    //                 fromMe: false,
    //                 id: m.key.id,
    //                 participant: m.key.participant
    //             }
    //         });

    //         // Wait for a short duration before kicking
    //         setTimeout(async () => {
    //             // await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
    //         }, 5000); // 5 seconds delay before kick
    //     }
    // }
};
