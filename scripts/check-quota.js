import { execSync } from 'child_process';

/**
 * Checks GitHub repository visibility, active runs, and actions billing quota.
 * @param {Object} options
 * @param {boolean} [options.strict=false] - If true, throws error when private and unapproved
 * @returns {Promise<{ isPublic: boolean, isPrivate: boolean, activeRuns: number, billing: any }>}
 */
export async function checkQuota(options = {}) {
  const { strict = false, allowPrivate = process.env.ALLOW_PRIVATE_BUILDS === 'true' } = options;

  console.log('🔍 Checking GitHub Actions quota and repository visibility...\n');

  let repoInfo = null;
  try {
    const raw = execSync('gh repo view --json isPrivate,visibility,owner,name', {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 2500,
    });
    repoInfo = JSON.parse(raw);
  } catch (err) {
    console.warn('⚠️ Could not query repository status via gh CLI. Ensure gh is installed and logged in.');
  }

  const isPrivate = repoInfo ? Boolean(repoInfo.isPrivate) : false;
  const isPublic = repoInfo ? !isPrivate : true;
  const repoName = repoInfo ? `${repoInfo.owner?.login || repoInfo.owner}/${repoInfo.name}` : 'sticker-database-manager';

  console.log(`📦 Repository: ${repoName}`);
  console.log(`🌐 Visibility: ${isPrivate ? '🔒 PRIVATE' : '🌍 PUBLIC'}`);

  let billingData = null;
  if (repoInfo?.owner?.login) {
    try {
      const rawBilling = execSync(`gh api /users/${repoInfo.owner.login}/settings/billing/actions`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 2500,
      });
      billingData = JSON.parse(rawBilling);
    } catch {
      // User scope may not be granted on the token
    }
  }

  if (billingData) {
    const used = billingData.total_minutes_used || 0;
    const included = billingData.included_minutes || 0;
    const paid = billingData.total_paid_minutes_used || 0;
    const remaining = Math.max(0, included - used);

    console.log('\n📊 GitHub Actions Runner Quota (Monthly):');
    console.log(`   - Included Minutes: ${included}`);
    console.log(`   - Used Minutes:     ${used}`);
    console.log(`   - Remaining:        ${remaining}`);
    if (paid > 0) {
      console.log(`   - Paid Minutes:     ${paid}`);
    }

    if (isPrivate && remaining <= 50) {
      console.error(`\n❌ ERROR: Only ${remaining} Actions minutes remaining! Build may exhaust your quota or incur charges.`);
      if (strict) {
        process.exit(1);
      }
    }
  } else if (isPrivate) {
    console.log('\n💡 Note: To display live billing quota, run: gh auth refresh -h github.com -s user');
  }

  // Check active runs only if gh CLI succeeded earlier
  let activeRunsCount = 0;
  if (repoInfo) {
    try {
      const rawRuns = execSync('gh run list --limit 5 --json databaseId,name,status,headBranch', {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 2500,
      });
      const runs = JSON.parse(rawRuns);
      const inProgress = runs.filter(r => r.status === 'in_progress' || r.status === 'queued');
      activeRunsCount = inProgress.length;

      if (inProgress.length > 0) {
        console.log(`\n⏳ Notice: ${inProgress.length} workflow run(s) currently in progress or queued:`);
        inProgress.forEach(r => console.log(`   - [#${r.databaseId}] ${r.name} (${r.status}) on ${r.headBranch}`));
      }
    } catch {
      // Non-fatal if gh run list fails
    }
  }

  console.log('\n------------------------------------------------------------');
  if (isPublic) {
    console.log('✅ PASS: Repository is PUBLIC.');
    console.log('   Standard GitHub-hosted runners (Ubuntu, Windows, macOS) are 100% FREE.');
    console.log('   No billable minutes will be deducted from your account.');
  } else {
    console.log('⚠️ CAUTION: Repository is PRIVATE.');
    console.log('   Private repository builds consume billable runner minutes:');
    console.log('   - Linux (Ubuntu): 1x multiplier (1 min = 1 min)');
    console.log('   - Windows:        2x multiplier (1 min = 2 min)');
    console.log('   - macOS:          10x multiplier (1 min = 10 min)');
    if (!allowPrivate && strict) {
      console.error('\n❌ Build blocked to prevent unintended Actions billing.');
      console.error('   To proceed on a private repo, pass --allow-private or set ALLOW_PRIVATE_BUILDS=true.');
      process.exit(1);
    }
  }
  console.log('------------------------------------------------------------\n');

  return { isPublic, isPrivate, activeRuns: activeRunsCount, billing: billingData };
}

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('check-quota.js')) {
  const isStrict = process.argv.includes('--strict');
  checkQuota({ strict: isStrict })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Quota check failed:', err.message);
      process.exit(1);
    });
}
