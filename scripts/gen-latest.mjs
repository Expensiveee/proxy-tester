import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import path from "path";

// --- NO MANUAL EDITING REQUIRED BELOW THIS LINE ---

console.log("Starting latest.json generation...");

// A recursive function to find all files with specific extensions in a directory
function findFilesByExt(startPath, filter) {
  let results = [];
  const files = readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = statSync(filename);
    if (stat.isDirectory()) {
      results = results.concat(findFilesByExt(filename, filter));
    } else if (filter.test(filename)) {
      results.push(filename);
    }
  }
  return results;
}

// 1. Read metadata directly from tauri.conf.json
const tauriConfPath = "./src-tauri/tauri.conf.json";
const tauriConf = JSON.parse(readFileSync(tauriConfPath, "utf8"));
const version = tauriConf.version;
if (!version) {
  throw new Error('Could not find "version" in tauri.conf.json');
}

// 2. Define the base URL for downloads
const githubRepo = "expensiveee/proxy-tester";
const baseDownloadURL = `https://github.com/${githubRepo}/releases/download/v${version}`;

// 3. Initialize the structure for the final JSON file
const latestJson = {
  version: `v${version}`,
  notes: "See the release notes on GitHub.",
  pub_date: new Date().toISOString(),
  platforms: {},
};

// 4. Use our custom function to find all updater artifacts
const releaseDir = "./src-tauri/target/release/bundle";
// Use a regular expression to find files ending in .tar.gz or .zip
const artifacts = findFilesByExt(releaseDir, /\.(tar\.gz|zip)$/);

if (artifacts.length === 0) {
  throw new Error(
    `No updater artifacts found in ${releaseDir}. Did the tauri build run correctly?`
  );
}

console.log(
  `Found ${artifacts.length} artifacts to process for version ${version}...`
);

// 5. Process each artifact to build the platforms object
for (const artifactPath of artifacts) {
  const signaturePath = `${artifactPath}.sig`;
  let platformKey = null;

  // Determine the platform key based on the file path
  if (artifactPath.includes("macos")) {
    platformKey = artifactPath.includes("aarch64")
      ? "darwin-aarch64"
      : "darwin-x86_64";
  } else if (artifactPath.includes("windows")) {
    platformKey = "windows-x86_64";
  } else if (artifactPath.includes("linux")) {
    platformKey = "linux-x86_64";
  }

  if (platformKey) {
    try {
      const signature = readFileSync(signaturePath, "utf8");
      const fileName = path.basename(artifactPath);

      latestJson.platforms[platformKey] = {
        signature,
        url: `${baseDownloadURL}/${fileName}`,
      };
      console.log(`  ✓ Added platform: ${platformKey}`);
    } catch (error) {
      console.error(
        `  ✗ Failed to read signature for ${artifactPath}: ${error.message}`
      );
    }
  }
}

// 6. Write the final JSON file to the release directory
const outputPath = path.resolve(releaseDir, "../latest.json"); // Place it in `target/release/`
writeFileSync(outputPath, JSON.stringify(latestJson, null, 2));

console.log(`\n✅ latest.json generated successfully at: ${outputPath}`);
console.log(JSON.stringify(latestJson, null, 2));
