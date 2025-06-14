// const sampleData = require("./sample_presence.json");
const fetchers = require("./fetch_data");
const fs = require("fs");
const path = require("path");

const TOTAL_VOTERS = 17_988_218;

const url =
  "https://prezenta.roaep.ro/prezidentiale18052025/data/json/simpv/presence/presence_now.json";

async function fetchNewData(now) {
  const presence = await fetchers.fetchWithPuppeteer(url);
  fs.writeFileSync(`data/attendance/${now}.json`, JSON.stringify(presence));
  return presence;
}

function countTotalVotes(data) {
  let totalVotes = 0;
  for (const c of data.county) {
    totalVotes = totalVotes + c.medium_u + c.medium_r;
  }
  return totalVotes;
}

function computePercentage(votesSoFar) {
  return ((100 * votesSoFar) / TOTAL_VOTERS).toFixed(2);
}

function readExistingData() {
  return JSON.parse(fs.readFileSync("public/presence.json", "utf8"));
}

async function refresh() {
  let fetchDate = null;
  let newData = null;
  if (process.argv.length < 3) {
    fetchDate = new Date().toISOString();
    newData = await fetchNewData(fetchDate);
  } else {
    fetchDate = new Date(path.basename(process.argv[2]).replace(".json", ""));
    newData = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  }
  const newTotalVotes = countTotalVotes(newData);
  const existingAgg = readExistingData();
  const newPresence = computePercentage(newTotalVotes);
  existingAgg.presence = [
    ...existingAgg.presence,
    { timestamp: fetchDate, presence: newPresence },
  ];
  fs.writeFileSync("public/presence.json", JSON.stringify(existingAgg));
}

refresh();
