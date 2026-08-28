import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET, ListObjectsV2Command, GetObjectCommand } from "../config/aws-config.js";

async function pullRepo() {
   const repoPath = path.resolve(process.cwd(), ".mygit");
   const commitsPath = path.join(repoPath, "commits");

   try {
      // List all objects with pagination support
      let allObjects = [];
      let continuationToken = undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: "commits/",
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
        // Parse key: "commits/<commitId>/<filename>"
        const parts = key.split('/');
        if (parts.length < 3) continue; // Skip directory markers

        const commitId = parts[1];
        const fileName = parts.slice(2).join('/');

        // Download to .mygit/commits/<commitId>/<filename>
        const localCommitDir = path.join(commitsPath, commitId);
        await fs.mkdir(localCommitDir, { recursive: true });

        const getCommand = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        });

        const response = await s3.send(getCommand);
        const bodyBuffer = await streamToBuffer(response.Body);
        await fs.writeFile(path.join(localCommitDir, fileName), bodyBuffer);
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
        const files = await fs.readdir(latestCommitDir);
        const workingDir = process.cwd();

        for (const file of files) {
          if (file === 'commit.json') continue;
          await fs.copyFile(
            path.join(latestCommitDir, file),
            path.join(workingDir, file)
          );
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

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export { pullRepo };