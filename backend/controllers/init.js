import fs from "fs/promises";
import path from "path";
import dotenv from 'dotenv';

dotenv.config();

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".mygit");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: process.env.S3_BUCKET || "nasir499" }, null, 2)
    );

    // Initialize HEAD pointer to track the latest commit
    await fs.writeFile(
      path.join(repoPath, "HEAD"),
      JSON.stringify({ current: null, branch: "main" }, null, 2)
    );

    console.log('Repository initialized successfully');
  } catch (error) {
    console.error('ERROR!! Initialising the repository', error);
    process.exit(1);
  }
}

export { initRepo };