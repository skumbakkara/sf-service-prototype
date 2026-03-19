/**
 * Copies SLDS 1 + SLDS 2 assets from npm into public/ for static serving.
 * - SLDS 1: only salesforce-lightning-design-system.min.css under public/slds/styles/
 *           and the full assets/images tree → public/slds/images/
 * - SLDS 2: slds2.cosmos.css → public/slds/styles/ (next to SLDS 1 min.css)
 * Runs on postinstall and before dev/build. public/slds/ is gitignored.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function copyFile(relSrc, destRel, label) {
    const src = path.join(root, relSrc);
    const dest = path.join(root, destRel);

    if (!fs.existsSync(src)) {
        console.error(`sync-slds-css: ${label} source missing (run npm install):`, src);
        process.exit(1);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`sync-slds-css: ${label} → ${path.relative(root, dest)}`);
}

function copyDirRecursive(relSrcDir, relDestDir, label) {
    const srcDir = path.join(root, relSrcDir);
    const destDir = path.join(root, relDestDir);

    if (!fs.existsSync(srcDir)) {
        console.error(`sync-slds-css: ${label} source missing (run npm install):`, srcDir);
        process.exit(1);
    }
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.mkdirSync(destDir, { recursive: true });

    function walk(from, to) {
        for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
            const s = path.join(from, ent.name);
            const d = path.join(to, ent.name);
            if (ent.isDirectory()) {
                fs.mkdirSync(d, { recursive: true });
                walk(s, d);
            } else {
                fs.copyFileSync(s, d);
            }
        }
    }
    walk(srcDir, destDir);
    console.log(`sync-slds-css: ${label} → ${path.relative(root, destDir)}/`);
}

const slds1StylesDir = path.join(root, 'public/slds/styles');
fs.rmSync(slds1StylesDir, { recursive: true, force: true });

copyFile(
    'node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css',
    'public/slds/styles/salesforce-lightning-design-system.min.css',
    'SLDS 1 stylesheet'
);

copyFile(
    'node_modules/@salesforce-ux/design-system-2/dist/css/slds2.cosmos.css',
    'public/slds/styles/slds2.cosmos.css',
    'SLDS 2 stylesheet'
);

copyDirRecursive(
    'node_modules/@salesforce-ux/design-system/assets/images',
    'public/slds/images',
    'SLDS 1 images'
);
