import fs from "fs/promises";
import path from "path";

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".mygit");
  const commitsPath = path.join(repoPath, "commits");
  

  try {
    await fs.mkdir(repoPath,{recursive:true});
    await fs.mkdir(commitsPath,{recursive:true});

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: "my-s3-bucket" || process.env.S3_BUCKET })
    )
    console.log('Repository initialized successfully');
  } catch (error) {
    console.log('ERROR!! Initialising the repository',error);
    
  }
}
export { initRepo };