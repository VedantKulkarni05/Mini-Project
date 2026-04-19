const express = require("express");
const os = require("os");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

// Future-ready server: static UI + easy API expansion.
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "campus-assist" });
});

function getNetworkUrls(port) {
  const interfaces = os.networkInterfaces();
  const urls = [];

  for (const entries of Object.values(interfaces)) {
    if (!entries) {
      continue;
    }

    for (const entry of entries) {
      const isIpv4 = entry.family === "IPv4" || entry.family === 4;
      if (isIpv4 && !entry.internal) {
        urls.push(`http://${entry.address}:${port}`);
      }
    }
  }

  return [...new Set(urls)];
}

app.listen(PORT, HOST, () => {
  console.log(`Campus Assist running at http://localhost:${PORT}`);

  const networkUrls = getNetworkUrls(PORT);
  if (networkUrls.length) {
    console.log("Network URLs:");
    networkUrls.forEach((url) => console.log(`  ${url}`));
  } else {
    console.log("No LAN IP detected. Connect to a network and retry.");
  }
});
