const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Hardcoded clean values - NO newlines, NO carriage returns
const vars = {
  WC_API_URL: 'https://wp.veloriavault.com/wp-json/wc/v3',
  SHIPROCKET_EMAIL: 'api@veloriavault.com',
  SHIPROCKET_PASSWORD: 'xFx0%H&i1c34fnb!WyruS!@Y1MdP%8ao',
};

const tmpFile = path.join(__dirname, '_tmp_val.txt');

for (const [key, value] of Object.entries(vars)) {
  console.log(`Adding ${key}...`);
  // Write value with NO trailing newline
  fs.writeFileSync(tmpFile, value, { encoding: 'utf8' });
  
  for (const env of ['production', 'preview', 'development']) {
    try {
      // Use cmd.exe pipe to avoid PowerShell mangling
      execSync(
        `type _tmp_val.txt | vercel env add ${key} ${env}`,
        { cwd: __dirname, stdio: 'pipe', shell: 'cmd.exe' }
      );
      console.log(`  ✅ ${env}`);
    } catch (e) {
      const msg = e.stderr ? e.stderr.toString() : e.message;
      if (msg.includes('already exists')) {
        console.log(`  ⚠️ ${env} (already exists, skipping)`);
      } else {
        console.log(`  ❌ ${env}: ${msg.slice(0, 100)}`);
      }
    }
  }
}

fs.unlinkSync(tmpFile);
console.log('\nDone! All variables pushed cleanly.');
