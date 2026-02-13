const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib/frontend');
const indexHtmlPath = path.join(libDir, 'index.html');

try {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const files = fs.readdirSync(libDir);

    const jsFiles = files.filter((f) => f.endsWith('.js'));

    // Sort logic
    const priority = ['runtime.js', 'polyfills.js', 'vendor.js', 'theia-core.js'];

    const sortedFiles = jsFiles.sort((a, b) => {
        const aIndex = priority.indexOf(a);
        const bIndex = priority.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // Move npm.* files earlier
        if (a.startsWith('npm.') && !b.startsWith('npm.')) return -1;
        if (!a.startsWith('npm.') && b.startsWith('npm.')) return 1;
        return a.localeCompare(b);
    });

    const scripts = sortedFiles
        .filter((f) => f !== 'bundle.js' && !f.includes('worker')) // bundle.js is already there, exclude workers
        .map((f) => `<script type="text/javascript" src="./${f}" charset="utf-8"></script>`)
        .join('\n    ');

    const patchedHtml = indexHtml.replace(
        '<script type="text/javascript" src="./bundle.js" charset="utf-8"></script>',
        `${scripts}\n    <script type="text/javascript" src="./bundle.js" charset="utf-8"></script>`
    );

    fs.writeFileSync(indexHtmlPath, patchedHtml);
    console.log('Patched index.html with ' + sortedFiles.length + ' scripts.');
} catch (err) {
    console.error('Error patching index.html:', err);
    process.exit(1);
}
