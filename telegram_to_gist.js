// telegram_to_gist.js
//
// This script synchronizes the latest JSON snapshot from a Telegram channel or group
// into a single canonical file in a GitHub Gist.  It performs the following steps:
//  1. Calls the Telegram Bot API to fetch pending updates (messages) for the bot.
//  2. Filters updates for documents in the specified chat whose filenames match
//     a user‑supplied regular expression (defaults to `pms_accommodation_\d+\.json`).
//  3. Determines the most recent matching document by comparing the message date.
//  4. Downloads the JSON file using the file_id via `getFile` and the file URL.
//  5. Normalizes the JSON to the shape `{ slips: [...] }`, regardless of the
//     original structure, to ensure consistent consumption by clients.
//  6. Retrieves the list of current files in the target gist, marks them for
//     deletion, and creates a new file called `pms_accommodation.json` with
//     the normalized content.
//  7. Acknowledges the processed updates by calling getUpdates with an offset
//     equal to the highest update_id + 1, preventing reprocessing on subsequent runs.
//
// Environment variables expected:
//   TG_BOT_TOKEN   – Telegram bot token with access to the target chat.
//   TG_CHAT_ID     – ID of the Telegram chat (positive for channels, negative for groups).
//   GIST_ID        – ID of the gist to update.
//   GH_TOKEN       – GitHub personal access token with gist write permissions.
//   FILE_REGEX     – (optional) regex to match snapshot filenames (as a string).
//   KEEP_HISTORY   – (optional) if set to any truthy value, the existing files in the gist
//                    are preserved and the new file is appended under its original name.
//
// Usage: node telegram_to_gist.js
// You can run this script manually or wire it into a GitHub Action.

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  const gistId = process.env.GIST_ID;
  const ghToken = process.env.GH_TOKEN;
  const fileRegex = process.env.FILE_REGEX ? new RegExp(process.env.FILE_REGEX) : /pms_accommodation_\d+\.json/i;
  const keepHistory = !!process.env.KEEP_HISTORY;

  if (!token || !chatId || !gistId || !ghToken) {
    console.error('Missing required environment variables. Ensure TG_BOT_TOKEN, TG_CHAT_ID, GIST_ID, and GH_TOKEN are set.');
    process.exit(1);
  }

  // Helper to call Telegram API
  async function tg(method, params = {}) {
    const url = `https://api.telegram.org/bot${token}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Telegram API error on ${method}: ${JSON.stringify(data)}`);
    }
    return data.result;
  }

  // Fetch pending updates; limit to reasonable number
  let updates;
  try {
    updates = await tg('getUpdates', { limit: 100, timeout: 0 });
  } catch (err) {
    console.error('Failed to fetch Telegram updates:', err);
    process.exit(1);
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    console.log('No new updates to process. Exiting.');
    return;
  }

  // Filter updates for document messages in our chat with filename matching regex
  const docUpdates = updates.filter(u => {
    const msg = u.message || u.channel_post;
    if (!msg || !msg.document) return false;
    if (String(msg.chat.id) !== String(chatId)) return false;
    const name = msg.document.file_name || '';
    return fileRegex.test(name);
  });

  if (docUpdates.length === 0) {
    // Acknowledge all pending updates so they don't accumulate
    const maxId = Math.max(...updates.map(u => u.update_id));
    await tg('getUpdates', { offset: maxId + 1, limit: 1 });
    console.log('No matching document updates found. Cleared pending updates.');
    return;
  }

  // Pick the latest document update by date or update_id
  docUpdates.sort((a, b) => {
    const tsA = (a.message || a.channel_post).date;
    const tsB = (b.message || b.channel_post).date;
    return tsB - tsA;
  });
  const latest = docUpdates[0];
  const latestId = latest.update_id;
  const msg = latest.message || latest.channel_post;
  const fileId = msg.document.file_id;
  const originalName = msg.document.file_name || 'snapshot.json';

  console.log(`Found latest snapshot: update_id=${latestId}, filename=${originalName}`);

  // Get file info to construct download URL
  let fileInfo;
  try {
    fileInfo = await tg('getFile', { file_id: fileId });
  } catch (err) {
    console.error('Failed to get file info:', err);
    process.exit(1);
  }

  const filePath = fileInfo.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

  // Download the file
  let fileContent;
  try {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fileContent = await res.text();
  } catch (err) {
    console.error('Failed to download file:', err);
    process.exit(1);
  }

  // Normalize JSON structure to { slips: [...] }
  let normalized;
  try {
    const parsed = JSON.parse(fileContent);
    let slips = [];
    if (Array.isArray(parsed)) {
      slips = parsed;
    } else if (Array.isArray(parsed.slips)) {
      slips = parsed.slips;
    } else if (parsed?.db?.stores?.slips?.rows) {
      slips = parsed.db.stores.slips.rows;
    }
    normalized = JSON.stringify({ slips }, null, 2);
  } catch (err) {
    console.error('Failed to parse JSON snapshot:', err);
    process.exit(1);
  }

  // Helper to call GitHub API
  async function gh(url, method = 'GET', body) {
    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${ghToken}`,
      'X-GitHub-Api-Version': '2022-11-28'
    };
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`GitHub API ${method} ${url} failed: ${res.status} ${txt}`);
    }
    return await res.json();
  }

  // Retrieve current gist to know existing files
  let gist;
  try {
    gist = await gh(`https://api.github.com/gists/${gistId}`);
  } catch (err) {
    console.error('Failed to fetch gist:', err);
    process.exit(1);
  }
  const existingFiles = Object.keys(gist.files || {});

  const filesPayload = {};
  if (!keepHistory) {
    // Mark all existing files for deletion
    for (const name of existingFiles) {
      filesPayload[name] = null;
    }
  }
  // Determine new filename: keep original if preserving history; else canonical name
  const newName = keepHistory ? originalName : 'pms_accommodation.json';
  filesPayload[newName] = { content: normalized };

  // Update gist
  try {
    await gh(`https://api.github.com/gists/${gistId}`, 'PATCH', {
      description: `Automated refresh on ${new Date().toISOString()}`,
      files: filesPayload
    });
    console.log(`Gist ${gistId} updated: wrote ${newName}, deleted ${!keepHistory ? existingFiles.join(', ') : 'none'}`);
  } catch (err) {
    console.error('Failed to update gist:', err);
    process.exit(1);
  }

  // Acknowledge updates so they aren't processed again
  const maxId = Math.max(...updates.map(u => u.update_id));
  try {
    await tg('getUpdates', { offset: maxId + 1, limit: 1 });
    console.log('Acknowledged updates up to', maxId);
  } catch (err) {
    console.warn('Failed to acknowledge updates:', err);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});