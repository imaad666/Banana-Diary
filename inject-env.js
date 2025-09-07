// Script to inject environment variables into the build
const fs = require('fs');
const path = require('path');

// Read the config template
const configPath = path.join(__dirname, 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Get the API key from environment
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
    // Inject the API key into the config
    configContent = configContent.replace(
        'window.GEMINI_API_KEY || \'AIzaSyC_vBTXaWKWBOFB9FuSHrSVo7kuF_bGREQ\'',
        `'${apiKey}'`
    );

    // Write the updated config
    fs.writeFileSync(configPath, configContent);
    console.log('✅ API key injected into config');
} else {
    console.log('⚠️  No GEMINI_API_KEY environment variable found, using fallback');
}
