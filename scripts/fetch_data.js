const puppeteer = require("puppeteer");
const sample = require("./sample_data.json");
const fs = require("fs");

const sleep = (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

async function fetchWithPuppeteer(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // const content1 = await page.content();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Wait for 6 seconds for the verification to complete
  await sleep(6);

  // Get the final JSON data
  // const content = await page.content();

  const content = await page.$eval(
    "body > pre",
    (element) => element.textContent
  );
  await browser.close();

  // console.debug("Content 1 is", content1);
  // console.debug("Content 2 is", content);

  return JSON.parse(content);
}

const myUrl =
  "https://prezenta.roaep.ro/prezidentiale18052025/data/json/sicpv/pv/pv_aggregated.json";

function calculateTotalVotesByCounty(rawResults) {
  const perCounty = rawResults.scopes["CNTY"]["PRSD"];
  const agg = {};
  Object.keys(perCounty)
    // after 43, we have each each sector in Bucharest, so we don't want
    // to count them twice
    .filter((k) => parseInt(k) <= 43)
    .forEach((k) => {
      perCounty[k].candidates.forEach((candidate) => {
        if (agg[candidate.id] == null) {
          agg[candidate.id] = candidate;
        } else {
          agg[candidate.id].votes += candidate.votes;
        }
      });
    });
  return agg;
}

function calculateTotalFromAcc(rawResults) {
  const agg = {};
  for (let c of rawResults.scopes["CNTRY"]["PRSD"]["RO"].candidates) {
    agg[c.id] = c;
  }
  for (let c of rawResults.scopes["CNTRY"]["PRSD_C"]["RO"].candidates) {
    if (agg[c.id] == null) {
      agg[c.id] = c;
    } else {
      agg[c.id].votes += c.votes;
    }
  }
}

function countC(rawResults) {
  const cc = rawResults.scopes["CNTRY"]["PRSD_C"]["RO"]["candidates"];
  let total = 0;
  for (let c of cc) {
    console.debug("hehe", c);
    total += c.votes;
  }
  return total;
}

async function main() {
  const now = new Date().toISOString();
  const result = await fetchWithPuppeteer(myUrl);
  fs.writeFileSync(`data/results/${now}.json`, JSON.stringify(result));
  const countedResult = calculateTotalVotesByCounty(result);
  const currentData = JSON.parse(fs.readFileSync("public/data.json", "utf8"));

  const nicusor = countedResult["P2-P"];
  const simion = countedResult["P1-P"];

  const total = simion.votes + nicusor.votes;
  currentData.votesX.push(total);
  currentData.candidates[0].votesY.push((nicusor.votes * 100) / total);
  currentData.candidates[1].votesY.push((simion.votes * 100) / total);
  fs.writeFileSync("public/data.json", JSON.stringify(currentData));
}

main();

module.exports = { fetchWithPuppeteer };
