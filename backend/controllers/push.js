import fs from "fs/promises";
import path from "path";
import { s3, S3_BUCKET, PutObjectCommand } from "../config/aws-config.js";

function renderProgressBar(current, total, filename = '') {
  const width = 30;
  const percentage = Math.round((current / total) * 100);
  const filledLength = Math.round((width * current) / total);
  const emptyLength = width - filledLength;

  const filledBar = '█'.repeat(filledLength);
  const emptyBar = '░'.repeat(emptyLength);

  const truncatedFile = filename.length > 28 ? '...' + filename.slice(-25) : filename;

  // \r overwrites the line cleanly in terminal
  process.stdout.write(`\rUploading: [${filledBar}${emptyBar}] ${percentage}% | ${current}/${total} files ${truncatedFile ? `(${truncatedFile})` : ''}          `);
  if (current === total) {
    process.stdout.write('\n');
  }
}

async function pushRepo() {
   const repoPath = path.resolve(process.cwd(), ".mygit");
   const commitsPath = path.join(repoPath, "commits");
   const pushTrackPath = path.join(repoPath, "push-track.json");
   const configPath = path.join(repoPath, "config.json");

   try {
      // Check if .mygit exists
      try {
        await fs.access(repoPath);
      } catch {
        console.error('Repository not initialized. Run "mygit init <repoId>" first.');
        return;
      }

      let repoId = null;
      let token = null;
      let apiUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

      try {
        const configData = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        repoId = configData.repoId || null;
        token = configData.token || null;
        if (configData.apiUrl) apiUrl = configData.apiUrl;
      } catch {
        // No config
      }

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

      console.log(`Found ${newCommits.length} un-pushed commit(s). Uploading to AWS S3...\n`);

      for (const commitDir of newCommits) {
         const commitPath = path.join(commitsPath, commitDir);
         const relativeFiles = await listFilesRecursive(commitPath, commitPath);

         const filePayloads = [];
         let processed = 0;
         const totalFiles = relativeFiles.length;

         renderProgressBar(0, totalFiles, 'Starting...');

         for (const relFile of relativeFiles) {
            const fullPath = path.join(commitPath, relFile);
            const content = await fs.readFile(fullPath, 'utf-8');
            filePayloads.push({
               path: relFile,
               content
            });
            processed++;
            renderProgressBar(processed, totalFiles, relFile);
         }

         let apiPushed = false;
         if (repoId) {
            try {
               const response = await fetch(`${apiUrl}/repo/${repoId}/push`, {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                     commitId: commitDir,
                     commitMessage: "CLI Commit",
                     files: filePayloads
                  })
               });

               if (response.ok) {
                  apiPushed = true;
               }
            } catch (apiErr) {
               // API server unreachable or direct SDK fallback required
            }
         }

         if (!apiPushed) {
            let s3Processed = 0;
            for (const relFile of relativeFiles) {
               const fullPath = path.join(commitPath, relFile);
               const fileContent = await fs.readFile(fullPath);
               const s3Key = repoId 
                 ? `repos/${repoId}/commits/${commitDir}/${relFile.replace(/\\/g, '/')}`
                 : `commits/${commitDir}/${relFile.replace(/\\/g, '/')}`;

               const command = new PutObjectCommand({
                  Bucket: S3_BUCKET,
                  Key: s3Key,
                  Body: fileContent,
               });

               await s3.send(command);
               s3Processed++;
               renderProgressBar(s3Processed, totalFiles, relFile);
            }
         }

         pushedCommits.push(commitDir);
      }

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