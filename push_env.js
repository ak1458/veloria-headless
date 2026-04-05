const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const lines = envFile.split('\n');

const envsToPush = [
    'WC_API_URL',
    'WC_CONSUMER_KEY',
    'WC_CONSUMER_SECRET',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'NEWSLETTER_ADMIN_KEY',
    'SHIPROCKET_EMAIL',
    'SHIPROCKET_PASSWORD'
];

console.log("Adding new variables...");
for (const line of lines) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    
    const index = line.indexOf('=');
    const key = line.substring(0, index).trim();
    let value = line.substring(index + 1).trim();
    
    // clean value
    value = value.replace(/['"]+/g, '');
    value = value.replace(/\\r\\n/g, '');
    
    if (envsToPush.includes(key)) {
        console.log(`Adding ${key}...`);
        fs.writeFileSync('temp_env_val.txt', value);
        const environments = ['production', 'preview', 'development'];
        for (const env of environments) {
            try {
                execSync(`node -e "process.stdout.write(require('fs').readFileSync('temp_env_val.txt', 'utf8'))" | vercel env add ${key} ${env}`, { stdio: 'ignore', shell: 'cmd.exe' });
            } catch (e) {
                console.error(`❌ Failed ${key} for ${env}`);
            }
        }
        console.log(`✅ Success: ${key}`);
    }
}
if(fs.existsSync('temp_env_val.txt')) fs.unlinkSync('temp_env_val.txt');
