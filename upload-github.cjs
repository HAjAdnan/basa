const fs = require('fs');
const path = require('path');
const https = require('https');

// Read config
const configPath = path.join(__dirname, '.github-config.json');
if (!fs.existsSync(configPath)) {
  console.error('Error: .github-config.json file not found!');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const TOKEN = config.github_token;
const USERNAME = config.github_username;
const REPO = config.github_repo_name;

if (!TOKEN || TOKEN.includes('YOUR_GITHUB_TOKEN') || !USERNAME || USERNAME.includes('YOUR_GITHUB_USERNAME')) {
  console.error('Error: Please fill in your real GitHub Username and Token in .github-config.json!');
  process.exit(1);
}

// Ignore list
const ignoreDirs = ['node', 'node_modules', 'dist', '.git', '.DS_Store'];
const ignoreFiles = ['.github-config.json', 'upload-github.js', '.DS_Store'];

// Helper to make HTTPS requests
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Recursively find files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        getFiles(filePath, fileList);
      }
    } else {
      if (!ignoreFiles.includes(file)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// Main Flow
async function main() {
  console.log(`🚀 Connecting to GitHub for user: ${USERNAME}...`);

  // 1. Create Repository (or check if exists)
  const createOpts = {
    hostname: 'api.github.com',
    path: '/user/repos',
    method: 'POST',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'Basa-Finder-Uploader',
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  };

  console.log(`Checking/Creating repository: ${REPO}...`);
  const createRes = await request(createOpts, {
    name: REPO,
    description: 'Basa Finder - Bangladesh House Renting Mobile Web App',
    private: true,
    auto_init: false
  });

  if (createRes.statusCode === 201) {
    console.log(`✅ Repository "${REPO}" successfully created!`);
  } else if (createRes.statusCode === 422) {
    console.log(`ℹ️ Repository "${REPO}" already exists. Proceeding with file upload...`);
  } else {
    console.error(`❌ Failed to verify/create repository. Status: ${createRes.statusCode}`);
    console.error(createRes.body);
    process.exit(1);
  }

  // 2. Get list of files to upload
  const files = getFiles(__dirname);
  console.log(`Found ${files.length} files to upload...`);

  // 3. Upload files sequentially
  for (const file of files) {
    const relativePath = path.relative(__dirname, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file);
    const base64Content = content.toString('base64');

    const uploadOpts = {
      hostname: 'api.github.com',
      path: `/repos/${USERNAME}/${REPO}/contents/${relativePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Basa-Finder-Uploader',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    // First check if file already exists to get its SHA (just in case)
    const checkOpts = { ...uploadOpts, method: 'GET' };
    const checkRes = await request(checkOpts);
    let sha = null;
    if (checkRes.statusCode === 200) {
      sha = checkRes.body.sha;
    }

    const body = {
      message: `upload: ${relativePath}`,
      content: base64Content
    };
    if (sha) {
      body.sha = sha;
    }

    console.log(`📤 Uploading: ${relativePath}...`);
    const uploadRes = await request(uploadOpts, body);

    if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
      console.log(`   ✅ Success!`);
    } else {
      console.error(`   ❌ Failed to upload. Status: ${uploadRes.statusCode}`);
      console.error(uploadRes.body);
    }
  }

  // 4. Clean up security sensitive config
  try {
    fs.unlinkSync(configPath);
    console.log('🧹 Cleaned up temporary credentials file (.github-config.json).');
  } catch (e) {}

  console.log('\n🎉 ALL FILES UPLOADED SUCCESSFULLY TO GITHUB!');
  console.log(`View your repository here: https://github.com/h/${USERNAME}/${REPO}`);
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
});
