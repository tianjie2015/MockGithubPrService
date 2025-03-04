const express = require("express");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const totalPrNumber = 5;

const DATA_DIR = path.join(__dirname, 'pull-requests-data');

const userEmailMap = {
  "tianjiedong": "tianjiedong@microsoft.com",
  "chrissu": "dongs@microsoft.com",
  "jigao": "gaoji@microsoft.com",
  "estherluo": "xiaoqlu@microsoft.com",
  "gracejia": "xuhanjia@microsoft.com",
  "zhejyan": "zhejyan@microsoft.com"
};

const userNameMap = {
  "tianjiedong": "Charles Dong",
  "chrissu": "Chris Su",
  "jigao": "Ji Gao",
  "estherluo": "Esther Luo",
  "gracejia": "Grace Jia",
  "zhejyan": "Jackie Yan"
};

function getDefualtEmailName(userId)
{
  return userId + "@microsoft.com"
}

function getDefualtEmailName(userId)
{
  return "Team member"
}

// Function to generate a deterministic hash
function hashString(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

function generateMockPR(userName, prId, index)
{
    return {
        id: prId,
        title: `Mock PR ${index} for ${userName}`,
        author: userName,
        created_at: new Date(Date.now() - index * 86400000).toISOString(), // Past days
        status: index % 2 === 0 ? "open" : "closed",
        repository: `repo-${userName}-${index}`,
    };
}

// Function to generate mock PRs deterministically based on username
function generateMockPRs(userName) {
  const seed = hashString(userName).slice(0, 8); // Take first 8 chars for a pseudo-seed
  const prList = [];

  for (let i = 1; i <= totalPrNumber; i++) {
    const prId = parseInt(seed, 16) % 10000 + i;
    prList.push(generateMockPR(userName, prId, i));
  }
  return prList;
}

// API Endpoint for recent pull requests
app.get('/get/recentpullrequests/:userName', (req, res) => {
  const userName = req.params.userName;
  const filePath = path.join(DATA_DIR, `${userName}.json`);
  const defaultFilePath = path.join(DATA_DIR, 'default.json');
  
  if (fs.existsSync(filePath)) {
      // Load the user-specific JSON file
      const data = Object.values(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
      res.json(data);
  } else {
      // Load default.json and modify createdBy fields
      if (fs.existsSync(defaultFilePath)) {
          let defaultData = Object.values(JSON.parse(fs.readFileSync(defaultFilePath, 'utf-8')));

          console.log("defaultData:", defaultData);
          console.log("Type of defaultData:", typeof defaultData);
          console.log("Keys in defaultData:", Object.keys(defaultData));

          let realData = defaultData.map(pr => ({
              ...pr,
              createdBy: {
                  displayName: "Bo Wu's Team member",
                  uniqueName: `${userName}@microsoft.com`
              }
          }));
          res.json(realData);
      } else {
          res.status(404).json({ error: "User not found and default file missing" });
      }
  }
});

// API Endpoint
app.get("/get/pullrequests/:userName", (req, res) => {
  const { userName } = req.params;
  res.json(generateMockPRs(userName));
});

app.listen(port, () => {
  console.log(`Mock GitHub PR service running on http://localhost:${port}`);
});