import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET, ListObjectsV2Command, GetObjectCommand } from "../config/aws-config.js";

async function pullRepo() {
   const repoPath = path.resolve(process.cwd(), ".mygit");
   const commitsPath = path.join(repoPath, "commits");
   const configPath = path.join(repoPath, "config.json");

   try {
      try {
        await fs.access(repoPath);
      } catch {
        console.error('Repository not initialized. Run "mygit init <repoId>" first.');
        return;
      }

      let repoId = null;
      try {
        const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        repoId = configData.repoId || null;
      } catch {
        // No config file found
      }

      const prefix = repoId ? `repos/${repoId}/commits/` : "commits/";

      // List all objects with pagination support
      let allObjects = [];
      let continuationToken = undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        });

        const data = await s3.send(command);
        if (data.Contents) {
          allObjects = allObjects.concat(data.Contents);
        }
        continuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
      } while (continuationToken);

      if (allObjects.length === 0) {
        console.log('No commits found on remote.');
        return;
      }

      for (const object of allObjects) {
        const key = object.Key;
        // Parse key: "repos/<repoId>/commits/<commitId>/<relativePath>" OR "commits/<commitId>/<relativePath>"
        const parts = key.split('/');
        const commitIdIndex = parts.indexOf('commits') + 1;
        if (commitIdIndex <= 0 || commitIdIndex >= parts.length - 1) continue;

        const commitId = parts[commitIdIndex];
        const fileName = parts.slice(commitIdIndex + 1).join('/');
        if (!fileName) continue;

        // Download to .mygit/commits/<commitId>/<fileName>
        const localFilePath = path.join(commitsPath, commitId, fileName);
        await fs.mkdir(path.dirname(localFilePath), { recursive: true });

        const getCommand = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        });

        const response = await s3.send(getCommand);
        const bodyBuffer = await streamToBuffer(response.Body);
        await fs.writeFile(localFilePath, bodyBuffer);
      }

      // Checkout the latest commit to working directory
      const commitDirs = await fs.readdir(commitsPath);
      let latestCommit = null;
      let latestDate = null;

      for (const dir of commitDirs) {
        try {
          const commitMeta = JSON.parse(
            await fs.readFile(path.join(commitsPath, dir, 'commit.json'), 'utf-8')
          );
          const commitDate = new Date(commitMeta.date);
          if (!latestDate || commitDate > latestDate) {
            latestDate = commitDate;
            latestCommit = dir;
          }
        } catch {
          // Skip invalid commit directories
        }
      }

      if (latestCommit) {
        const latestCommitDir = path.join(commitsPath, latestCommit);
        const relativeFiles = await listFilesRecursive(latestCommitDir, latestCommitDir);
        const workingDir = process.cwd();

        for (const relFile of relativeFiles) {
          if (relFile === 'commit.json' || relFile.endsWith('commit.json')) continue;
          const srcFile = path.join(latestCommitDir, relFile);
          const destFile = path.join(workingDir, relFile);
          await fs.mkdir(path.dirname(destFile), { recursive: true });
          await fs.copyFile(srcFile, destFile);
        }

        // Update HEAD
        await fs.writeFile(
          path.join(repoPath, 'HEAD'),
          JSON.stringify({ current: latestCommit, branch: 'main' }, null, 2)
        );

        console.log(`Pulled and checked out latest commit: ${latestCommit}`);
      } else {
        console.log('All commits pulled from S3.');
      }
   } catch (error) {
      console.error("Error pulling from S3:", error);
   }
}

async function listFilesRecursive(dirPath, basePath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await listFilesRecursive(fullPath, basePath));
    } else {
      files.push(path.relative(basePath, fullPath));
    }
  }

  return files;
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export { pullRepo };