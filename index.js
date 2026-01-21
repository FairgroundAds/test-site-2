import fs from "fs";
import path from "path";

const outDir = "./dist";
const CMS_API_URL = process.env.CMS_API_URL || "https://expd.thefairground.com/api";
const SITE_DOMAIN = process.env.SITE_DOMAIN || "expd.thefairground.com";

// Fetch placements from CMS API
async function fetchPlacements() {
  try {
    const response = await fetch(`${CMS_API_URL}/placements/for-domain/${SITE_DOMAIN}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch placements from CMS: ${response.status}`);
      return {};
    }
    
    const data = await response.json();
    return data.placements || {};
  } catch (error) {
    console.error("Error fetching placements from CMS:", error.message);
    return {};
  }
}

function walk(dir) {
  return fs.readdirSync(dir).flatMap(file => {
    const full = path.join(dir, file);
    return fs.statSync(full).isDirectory() ? walk(full) : full;
  });
}

// Main build process
(async () => {
  console.log(`Fetching link lists for ${SITE_DOMAIN} from ${CMS_API_URL}...`);
  
  const placements = await fetchPlacements();
  
  if (Object.keys(placements).length === 0) {
    console.warn("No placements found. Using empty content.");
  } else {
    console.log(`Found ${Object.keys(placements).length} placement(s):`, Object.keys(placements));
  }

  for (const file of walk(outDir)) {
    if (!file.endsWith(".html")) continue;

    let html = fs.readFileSync(file, "utf8");

    // Replace each placement variable with content from CMS
    for (const [key, value] of Object.entries(placements)) {
      html = html.replaceAll(`${key}`, value || '');
    }

    fs.writeFileSync(file, html);
    console.log(`Processed: ${file}`);
  }
  
  console.log("Build complete!");
})();
