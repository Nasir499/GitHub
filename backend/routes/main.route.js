import express from 'express'
import { userrouter } from './user.route.js';
import { repoRouter } from './repo.route.js';
import { issueRouter } from './issue.route.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainrouter = express.Router();

mainrouter.use(userrouter)
mainrouter.use(repoRouter)
mainrouter.use(issueRouter)

// Automated PowerShell installer script endpoint for outside users
mainrouter.get('/install.ps1', (req, res) => {
    const host = req.get('host');
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        protocol = 'https';
    }
    const backendUrl = `${protocol}://${host}`;

    const psScript = `# Automated mygit CLI installer for Windows
$ErrorActionPreference = 'Stop'
Write-Host "🚀 Installing mygit CLI..." -ForegroundColor Cyan

$winApps = "$env:LOCALAPPDATA\\Microsoft\\WindowsApps"
if (!(Test-Path $winApps)) {
    New-Item -ItemType Directory -Path $winApps -Force | Out-Null
}

$cliJs = "$winApps\\mygit-cli.js"
$batPath = "$winApps\\mygit.bat"

# Download standalone CLI script from server
Invoke-WebRequest -Uri "${backendUrl}/cli-bundle.js" -OutFile $cliJs -UseBasicParsing -MaximumRedirection 10

# Create batch wrapper executable in WindowsApps
$cmdContent = '@echo off' + [Environment]::NewLine + 'node "' + $cliJs + '" %*'
Set-Content -Path $batPath -Value $cmdContent -Force

Write-Host "🎉 Successfully installed mygit CLI system-wide!" -ForegroundColor Green
Write-Host "💡 You can now run 'mygit' in any terminal window on your machine!" -ForegroundColor Yellow
`;

    res.setHeader('Content-Type', 'text/plain');
    res.send(psScript);
});

// Standalone CLI script bundle downloaded by outside users
mainrouter.get('/cli-bundle.js', (req, res) => {
    const host = req.get('host');
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        protocol = 'https';
    }
    const backendUrl = `${protocol}://${host}`;

    const cliBundle = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

const API_URL = "${backendUrl}";

function renderProgressBar(current, total, filename) {
    const width = 30;
    const percentage = Math.round((current / total) * 100);
    const filledLength = Math.round((width * current) / total);
    const emptyLength = width - filledLength;

    const filledBar = '█'.repeat(filledLength);
    const emptyBar = '░'.repeat(emptyLength);

    const truncatedFile = filename.length > 25 ? '...' + filename.slice(-22) : filename;

    process.stdout.write(\`\\rUploading: [\${filledBar}\${emptyBar}] \${percentage}% | \${current}/\${total} files (\${truncatedFile})          \`);
    if (current === total) {
        process.stdout.write('\\n');
    }
}

async function main() {
    if (!command || command === '--help' || command === '-h') {
        console.log(\`
mygit CLI (v1.0.0) - Connected to \${API_URL}

Commands:
  mygit init <repoId>       Initialize project with Repository ID
  mygit add <file|.>        Stage files for commit
  mygit commit <message>    Create commit snapshot
  mygit push                Push committed files to AWS S3 via Server
\`);
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.mygit');

    if (command === 'login') {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = (q) => new Promise(res => rl.question(q, res));

        const username = await ask('Username or Email: ');
        const password = await ask('Password: ');
        rl.close();

        try {
            const resStr = await postJson(\`\${API_URL}/login\`, JSON.stringify({ username, password }));
            const resData = JSON.parse(resStr);
            if (resData.token) {
                const globalDir = path.join(process.env.USERPROFILE || process.env.HOME || '', '.mygit');
                fs.mkdirSync(globalDir, { recursive: true });
                fs.writeFileSync(path.join(globalDir, 'credentials.json'), JSON.stringify({ token: resData.token, userId: resData.userId }, null, 2));
                console.log('\\n🎉 Successfully logged in! Credentials stored securely in user profile.');
            } else {
                console.error('\\n❌ Login failed: Invalid credentials');
            }
        } catch (err) {
            console.error(\`\\n❌ Login failed: \${err.message}\`);
        }
    }
    else if (command === 'init') {
        const repoId = param;
        const token = args[2];
        if (!repoId) {
            console.error('Error: Please provide a Repository ID (e.g. mygit init <repoId> [token])');
            process.exit(1);
        }
        fs.mkdirSync(path.join(repoPath, 'commits'), { recursive: true });
        fs.mkdirSync(path.join(repoPath, 'staging'), { recursive: true });
        const configObj = { repoId, apiUrl: API_URL };
        if (token) configObj.token = token;
        fs.writeFileSync(path.join(repoPath, 'config.json'), JSON.stringify(configObj, null, 2));
        fs.writeFileSync(path.join(repoPath, 'HEAD'), JSON.stringify({ current: null, branch: 'main' }, null, 2));
        console.log(\`Repository initialized successfully for repo: \${repoId}\`);
    } 
    else if (command === 'auth') {
        const token = param;
        if (!token) {
            console.error('Error: Please provide a JWT token (e.g. mygit auth <token>)');
            process.exit(1);
        }
        let configObj = { apiUrl: API_URL };
        const configPath = path.join(repoPath, 'config.json');
        if (fs.existsSync(configPath)) {
            try { configObj = JSON.parse(fs.readFileSync(configPath, 'utf-8')); } catch(e){}
        }
        configObj.token = token;
        fs.writeFileSync(configPath, JSON.stringify(configObj, null, 2));
        console.log('🎉 Auth token saved successfully to local repository config!');
    }
    else if (command === 'add') {
        const fileTarget = param || '.';
        const stagingPath = path.join(repoPath, 'staging');
        fs.mkdirSync(stagingPath, { recursive: true });

        if (fileTarget === '.') {
            stageDir(process.cwd(), process.cwd(), stagingPath);
            console.log('All files added to staging area successfully');
        } else {
            const targetAbs = path.resolve(process.cwd(), fileTarget);
            if (fs.existsSync(targetAbs) && fs.statSync(targetAbs).isDirectory()) {
                stageDir(targetAbs, process.cwd(), stagingPath);
                console.log(\`Directory \${fileTarget} added to staging area successfully\`);
            } else {
                const rel = path.relative(process.cwd(), targetAbs);
                const dest = path.join(stagingPath, rel);
                fs.mkdirSync(path.dirname(dest), { recursive: true });
                fs.copyFileSync(targetAbs, dest);
                console.log(\`File \${fileTarget} added to staging area successfully\`);
            }
        }
    } 
    else if (command === 'commit') {
        const message = param || 'Update files';
        const stagingPath = path.join(repoPath, 'staging');
        const commitsPath = path.join(repoPath, 'commits');
        const commitId = generateUUID();
        const commitDir = path.join(commitsPath, commitId);

        if (!fs.existsSync(stagingPath) || fs.readdirSync(stagingPath).length === 0) {
            console.error('Nothing to commit. Staging area is empty.');
            return;
        }

        fs.mkdirSync(commitDir, { recursive: true });
        copyDir(stagingPath, commitDir);
        fs.writeFileSync(path.join(commitDir, 'commit.json'), JSON.stringify({
            id: commitId,
            message,
            date: new Date().toISOString()
        }, null, 2));

        fs.writeFileSync(path.join(repoPath, 'HEAD'), JSON.stringify({ current: commitId, branch: 'main' }, null, 2));
        fs.rmSync(stagingPath, { recursive: true, force: true });
        fs.mkdirSync(stagingPath, { recursive: true });

        console.log(\`Changes committed with ID: \${commitId}\`);
    } 
    else if (command === 'push') {
        const configPath = path.join(repoPath, 'config.json');
        const pushTrackPath = path.join(repoPath, 'push-track.json');
        const commitsPath = path.join(repoPath, 'commits');

        if (!fs.existsSync(configPath)) {
            console.error('Repository not initialized. Run "mygit init <repoId>" first.');
            return;
        }

        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const repoId = configData.repoId;
        let token = configData.token || process.env.MYGIT_TOKEN;

        if (!token) {
            const globalCredPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.mygit', 'credentials.json');
            if (fs.existsSync(globalCredPath)) {
                try {
                    const credData = JSON.parse(fs.readFileSync(globalCredPath, 'utf-8'));
                    token = credData.token;
                } catch(e){}
            }
        }

        let pushedCommits = [];
        if (fs.existsSync(pushTrackPath)) {
            try { pushedCommits = JSON.parse(fs.readFileSync(pushTrackPath, 'utf-8')).pushed || []; } catch(e){}
        }

        const commitDirs = fs.readdirSync(commitsPath).filter(dir => !pushedCommits.includes(dir));
        if (commitDirs.length === 0) {
            console.log('Everything up to date. No new commits to push.');
            return;
        }

        console.log(\`Found \${commitDirs.length} un-pushed commit(s). Uploading to server...\\n\`);

        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const relFiles = listFilesRec(commitPath, commitPath);

            const filePayloads = [];
            let processed = 0;
            const totalFiles = relFiles.length;

            renderProgressBar(0, totalFiles, 'Starting...');

            for (const relFile of relFiles) {
                const fullPath = path.join(commitPath, relFile);
                const content = fs.readFileSync(fullPath, 'utf-8');
                filePayloads.push({ path: relFile, content });
                processed++;
                renderProgressBar(processed, totalFiles, relFile);
            }

            const postData = JSON.stringify({
                commitId: commitDir,
                commitMessage: "CLI Commit",
                files: filePayloads
            });

            try {
                await postJson(\`\${API_URL}/repo/\${repoId}/push\`, postData, token);
                pushedCommits.push(commitDir);
            } catch (err) {
                console.error(\`\\n❌ Push failed: \${err.message}\`);
                process.exit(1);
            }
        }

        fs.writeFileSync(pushTrackPath, JSON.stringify({ pushed: pushedCommits }, null, 2));
        console.log(\`\\n🎉 Successfully pushed \${commitDirs.length} commit(s) to server & AWS S3!\`);
    }
}

function stageDir(dirPath, rootPath, stagingPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (['.mygit', 'node_modules', '.git'].includes(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            stageDir(fullPath, rootPath, stagingPath);
        } else {
            const rel = path.relative(rootPath, fullPath);
            const dest = path.join(stagingPath, rel);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(fullPath, dest);
        }
    }
}

function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(d, { recursive: true });
            copyDir(s, d);
        } else {
            fs.copyFileSync(s, d);
        }
    }
}

function listFilesRec(dirPath, basePath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(listFilesRec(fullPath, basePath));
        } else {
            files.push(path.relative(basePath, fullPath));
        }
    }
    return files;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function postJson(urlStr, data, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const lib = url.protocol === 'https:' ? https : http;
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const req = lib.request(urlStr, {
            method: 'POST',
            headers
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    let errMsg = body;
                    try {
                        const parsed = JSON.parse(body);
                        errMsg = parsed.message || body;
                    } catch(e) {}
                    reject(new Error(\`Server error (\${res.statusCode}): \${errMsg}\`));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

main().catch(err => console.error(err));
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.send(cliBundle);
});

mainrouter.get('/', (req, res) => {
    res.send("HELLO");
});

export { mainrouter };
