import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET, PutObjectCommand } from "../config/aws-config.js";

async function pushRepo() {
   const repoPath = path.resolve(process.cwd(), ".mygit");
   const commitsPath = path.join(repoPath, "commits");
   const pushTrackPath = path.join(repoPath, "push-track.json");

   try {
      // Check if .mygit exists
      try {
        await fs.access(repoPath);
      } catch {
        console.error('Repository not initialized. Run "node index.js init" first.');
        return;
      }

      // Load previously pushed commits
      let pushedCommits = [];
      try {
        const trackData = await fs.readFile(pushTrackPath, 'utf-8');
        pushedCommits = JSON.parse(trackData).pushed || [];
      } catch {
        // No tracking file yet
      }

      const commitDirs = await fs.readdir(commitsPath);
      const newCommits = commitDirs.filter(dir => !pushedCommits.includes(dir));

      if (newCommits.length === 0) {
        console.log('Everything up to date. No new commits to push.');
        return;
      }

      console.log(`Found ${newCommits.length} un-pushed commit(s). Uploading to S3 bucket "${S3_BUCKET}"...\n`);

      for (const commitDir of newCommits) {
         const commitPath = path.join(commitsPath, commitDir);
         const filesToUpload = await listFilesRecursive(commitPath, commitPath);

         for (const relativeFilePath of filesToUpload) {
            const fullPath = path.join(commitPath, relativeFilePath);
            const fileContent = await fs.readFile(fullPath);
            const s3Key = `commits/${commitDir}/${relativeFilePath.replace(/\\/g, '/')}`;

            console.log(` ⬆ Uploading: ${s3Key} (${fileContent.length} bytes)...`);

            const command = new PutObjectCommand({
               Bucket: S3_BUCKET,
               Key: s3Key,
               Body: fileContent,
            });

            await s3.send(command);
         }

         pushedCommits.push(commitDir);
      }

      // Save push tracking
      await fs.writeFile(pushTrackPath, JSON.stringify({ pushed: pushedCommits }, null, 2));

      console.log(`\n🎉 Successfully pushed ${newCommits.length} commit(s) to AWS S3!`);
   } catch (error) {
      console.error("Error pushing to S3:", error);
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

export { pushRepo };