const puppeteer = require("puppeteer");
const sample = require("./sample_data.json");

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
  "https://prezenta.roaep.ro/prezidentiale04052025/data/json/sicpv/pv/pv_aggregated.json";

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

// console.debug("PRDSC is ", countC(sample));
// console.debug("Total is", calculateTotalVotes(sample));
// console.debug("Sample is ", sample);
// console.debug("Keys in cnty are", Object.keys(sample.scopes["CNTY"]["PRSD"]))

// fetchWithPuppeteer(myUrl).then((data) => {
//   console.log(JSON.stringify(data));
// });

// Usage example
// const targetUrl = 'https://your-protected-url.com';

// // Method 1: Using custom algorithm
// fetchProtectedData(targetUrl)
//   .then(data => {
//     console.log('Successfully retrieved data:', data);
//   })
//   .catch(error => {
//     console.error('Failed to retrieve data (custom method):', error);

//     // Fall back to puppeteer if the custom method fails
//     console.log('Trying with puppeteer...');
//     return fetchWithPuppeteer(targetUrl);
//   })
//   .then(data => {
//     if (data) {
//       console.log('Successfully retrieved data with puppeteer');
//     }
//   })
//   .catch(error => {
//     console.error('All methods failed:', error);
//   });

module.exports = { fetchWithPuppeteer };
