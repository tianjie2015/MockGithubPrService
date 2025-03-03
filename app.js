const express = require("express");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;
const totalPrNumber = 5;

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

// API Endpoint
app.get("/get/pullrequests/:userName", (req, res) => {
  const { userName } = req.params;
  res.json(generateMockPRs(userName));
});

app.listen(port, () => {
  console.log(`Mock GitHub PR service running on http://localhost:${port}`);
});