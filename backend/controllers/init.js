import fs from "fs/promises";
import path from "path";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendEnvPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: backendEnvPath });

async function initRepo(repoId) {
  const repoPath = path.resolve(process.cwd(), ".mygit");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });

    const configData = {
      bucket: process.env.S3_BUCKET || "nasir499-github-clone"
    };

    if (repoId && typeof repoId === 'string') {
      configData.repoId = repoId;
    }

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(configData, null, 2)
    );

    // Initialize HEAD pointer to track the latest commit
    await fs.writeFile(
      path.join(repoPath, "HEAD"),
      JSON.stringify({ current: null, branch: "main" }, null, 2)
    );

    console.log('Repository initialized successfully' + (repoId ? ` for repo: ${repoId}` : ''));
  } catch (error) {
    console.error('ERROR!! Initialising the repository', error);
    process.exit(1);
  }
}

export { initRepo };