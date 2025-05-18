const sampleData = require("./sample_presence.json");
const fetchers = require("./fetch_data");
const fs = require("fs");

const url =
  "https://prezenta.roaep.ro/prezidentiale18052025/data/json/simpv/presence/presence_now.json";

async function fetchNewData() {
  const now = new Date().toISOString();
  const presence = await fetchers.fetchWithPuppeteer(url);
  fs.writeFileSync(`data/attendance/${now}.json`, JSON.stringify(presence));
}

fetchNewData();
