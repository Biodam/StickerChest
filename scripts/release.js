import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

let targetVersion = process.argv[2];

if (!targetVersion) {
  targetVersion = pkg.version;
} else if (targetVersion.startsWith('v')) {
  targetVersion = targetVersion.slice(1);
}

// Update package.json version if different
if (targetVersion !== pkg.version) {
  pkg.version = targetVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`Updated package.json version to ${targetVersion}`);
  try {
    execSync(`git add package.json && git commit -m "chore(release): bump version to v${targetVersion}"`, { stdio: 'inherit' });
  } catch (err) {
    // If no changes, proceed
  }
}

const tag = `v${targetVersion}`;

// Check if tag exists
try {
  const existingTags = execSync('git tag', { encoding: 'utf-8' }).split('\n');
  if (existingTags.includes(tag)) {
    console.log(`Tag ${tag} already exists locally.`);
  } else {
    console.log(`Creating git tag ${tag}...`);
    execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
    console.log(`Successfully created tag ${tag}!`);
  }
} catch (err) {
  console.error('Failed to create tag:', err.message);
  process.exit(1);
}

console.log('\n=========================================');
console.log(`🚀 Release ${tag} is ready to trigger!`);
console.log('=========================================');
console.log('To trigger the automated GitHub Actions build & release:');
console.log(`  git push origin main --tags`);
console.log('\nGitHub Actions will automatically:');
console.log('  1. Compile Windows NSIS installer & portable .exe on windows-latest');
console.log('  2. Compile macOS DMG & zipped app bundle on macos-latest');
console.log(`  3. Publish all assets to GitHub Releases under tag ${tag}`);
