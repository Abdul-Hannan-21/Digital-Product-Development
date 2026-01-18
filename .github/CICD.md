# CI/CD Pipeline Documentation

This repository includes automated CI/CD pipelines using GitHub Actions. The pipelines automatically run on code pushes and pull requests.

## Overview

### Continuous Integration (CI) Pipeline
**File:** `.github/workflows/ci.yml`  
**Triggers:** Push to any branch, Pull requests to any branch

The CI pipeline ensures code quality and buildability through the following stages:

#### Stage 1: ESLint Code Quality Check
- **Purpose:** Lint TypeScript/TSX files using ESLint
- **Command:** `npm run lint`
- **Failure Action:** Pipeline stops, error reported

#### Stage 2: TypeScript Type Check
- **Purpose:** Validate TypeScript types in frontend and backend
- **Command:** `npm run type-check`
- **Checks:**
  - Frontend types (`tsc -p . --noEmit`)
  - Convex backend types (`tsc -p convex --noEmit`)
- **Failure Action:** Pipeline stops, error reported

#### Stage 3: Build Application
- **Purpose:** Build both frontend (Vite) and backend (Convex)
- **Prerequisites:** Requires lint and type-check to pass
- **Commands:**
  - `npm run build:convex` - Builds Convex backend
  - `npm run build` - Builds React frontend using Vite
- **Artifacts:** Build outputs are uploaded and retained for 7 days
- **Failure Action:** Pipeline stops, error reported

#### Stage 4: Tests (Currently Disabled)
- **Purpose:** Run test suite (placeholder for future test framework integration)
- **Status:** Disabled until test framework is set up
- **To Enable:** Set `if: false` to `if: true` in the test job and configure your test framework

#### Failure Handling & Notifications
- **On Failure:** 
  - Workflow summary shows detailed failure information
  - Build artifacts are preserved for debugging
  - All failure information includes: workflow name, branch, commit SHA, actor
- **Logs:** Available in GitHub Actions UI under "Actions" tab
- **Notifications:** GitHub Actions provides built-in email notifications on failure

---

### Continuous Delivery/Deployment (CD) Pipeline
**File:** `.github/workflows/cd.yml`  
**Triggers:** 
- Push to `main`, `master`, or `develop` branches
- Manual workflow dispatch (with environment selection)

The CD pipeline packages and deploys the application:

#### Stage 1: Build and Package
- **Purpose:** Create production-ready build artifacts
- **Commands:**
  - `npm run build:convex` - Build Convex backend
  - `npm run build` - Build frontend for production
- **Output:** Packaged as `dist-{sha}.tar.gz` and uploaded as artifact
- **Retention:** Artifacts retained for 30 days

#### Stage 2: Deploy to Staging (Automatic)
- **Purpose:** Deploy to Netlify as draft/deploy preview automatically
- **Trigger:** Push to `develop`, `main`, or `master` branches
- **Environment:** Configured via GitHub Environments (name: `staging`)
- **Platform:** Netlify (draft deployment)
- **Command:** `netlify deploy --dir=dist`
- **Status:** ✅ **Configured for Netlify deployment**

#### Stage 3: Deploy to Production (Manual Approval Required)
- **Purpose:** Deploy to Netlify production environment
- **Trigger:** 
  - Push to `main` or `master` branches (after staging succeeds)
  - Manual workflow dispatch with `production` environment
- **Environment:** Configured via GitHub Environments (name: `production`)
- **Platform:** Netlify (production deployment)
- **Command:** `netlify deploy --prod --dir=dist`
- **Approval:** Manual approval required (configure in GitHub Environment settings)
- **Prerequisites:** Staging deployment must succeed first
- **Status:** ✅ **Configured for Netlify deployment**

#### Deployment Environments Configuration
To enable manual approval for production deployments:
1. Go to repository Settings → Environments
2. Create/configure `production` environment
3. Add required reviewers
4. Configure deployment URL and protection rules

---

## Configuration

### Required Secrets
Add the following secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

**Required for Netlify Deployment:**
- **`NETLIFY_AUTH_TOKEN`** (required): Netlify authentication token
  - Get from: Netlify Dashboard → User settings → Applications → New access token
- **`NETLIFY_SITE_ID`** (required): Your Netlify site ID
  - Get from: Netlify Dashboard → Site settings → General → Site details
  - Or from your site URL: `https://app.netlify.com/sites/{site-id}/overview`

**Optional Secrets:**
- **`CONVEX_DEPLOYMENT`** (optional): Convex deployment URL/key for CI builds
- **`NETLIFY_STAGING_URL`** (optional): Netlify staging/deploy preview URL (for environment display)
- **`NETLIFY_PRODUCTION_URL`** (optional): Netlify production site URL (for environment display)

### Optional Notifications
To enable Slack/email notifications on failure:
1. Add webhook URL to secrets: `SLACK_WEBHOOK_URL`
2. Uncomment notification steps in workflow files
3. Install required action: `8398a7/action-slack@v3`

---

## Netlify Deployment Setup

The CD pipeline is configured for Netlify deployment. Follow these steps to complete the setup:

### Step 1: Get Netlify Credentials

1. **Netlify Auth Token:**
   - Go to: [Netlify User Settings → Applications](https://app.netlify.com/user/applications)
   - Click "New access token"
   - Give it a name (e.g., "GitHub Actions CI/CD")
   - Copy the token (you'll only see it once!)

2. **Netlify Site ID:**
   - Go to your site in Netlify Dashboard
   - Navigate to: Site settings → General → Site details
   - Copy the "Site ID" (or extract from URL: `https://app.netlify.com/sites/{site-id}`)

### Step 2: Add Secrets to GitHub

1. Go to your repository on GitHub
2. Navigate to: Settings → Secrets and variables → Actions
3. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

### Step 3: Configure Netlify Site (Optional)

If you haven't already:
1. Create a `netlify.toml` file in your repository root (optional but recommended)
2. Or configure build settings in Netlify Dashboard:
   - Build command: `npm run build:all`
   - Publish directory: `dist`

**Note:** The workflow builds locally in CI/CD, so Netlify build settings won't be used, but they're good for local development.

### Step 4: Deploy!

Once secrets are configured:
- Push to `develop` branch → Staging deployment (draft)
- Push to `main`/`master` branch → Staging then Production deployment

### Deployment Commands Used

**Staging (Draft Deployment):**
```bash
netlify deploy --dir=dist \
  --auth=$NETLIFY_AUTH_TOKEN \
  --site=$NETLIFY_SITE_ID
```

**Production Deployment:**
```bash
netlify deploy --prod --dir=dist \
  --auth=$NETLIFY_AUTH_TOKEN \
  --site=$NETLIFY_SITE_ID
```

---

## Workflow Status

View pipeline status:
- **In Repository:** Go to "Actions" tab in GitHub
- **Badge:** Add to README.md:
  ```markdown
  ![CI](https://github.com/USERNAME/REPO/workflows/Continuous%20Integration/badge.svg)
  ```

---

## Pipeline Behavior

### On Push
1. **CI Pipeline** runs immediately (lint → type-check → build → test)
2. **CD Pipeline** runs automatically on `main`/`master`/`develop`:
   - Builds and packages application
   - Deploys to staging automatically
   - Deploys to production (requires manual approval if configured)

### On Pull Request
- Only **CI Pipeline** runs (to validate code before merge)
- CD Pipeline does not run on PRs

### Manual Trigger
- CD Pipeline can be manually triggered via "Actions" → "Run workflow"
- Select environment (staging/production)

---

## Error Handling & Feedback

### When a Build Fails:
1. **Workflow Summary** shows:
   - Failed job name
   - Branch and commit SHA
   - Actor who triggered the run
   - Link to detailed logs

2. **Logs Available:**
   - Full build logs in GitHub Actions UI
   - Each job step shows output
   - Artifacts preserved for 7 days (CI) or 30 days (CD)

3. **Notifications:**
   - GitHub sends email notifications (if enabled in GitHub settings)
   - Status badge updates to show failure
   - PR checks show failure status

### Feedback Loops:
- ✅ **Immediate:** GitHub Actions UI shows real-time build status
- ✅ **Pull Requests:** PR checks prevent merging broken code
- ✅ **Artifacts:** Build artifacts saved for debugging
- ✅ **Summaries:** Each workflow run generates a summary with key information

---

## Troubleshooting

### Build Fails on Lint
- Check ESLint output in workflow logs
- Run `npm run lint:fix` locally to auto-fix issues
- Review ESLint configuration in `eslint.config.js`

### Build Fails on Type Check
- Check TypeScript errors in workflow logs
- Run `npm run type-check` locally to see errors
- Ensure all types are properly defined

### Build Fails on Build Step
- Check for build errors in workflow logs
- Verify all dependencies are in `package.json`
- Ensure environment variables are set correctly

### Deployment Fails
- Check deployment step logs
- Verify deployment secrets are configured
- Ensure deployment commands are correct in workflow file
- Check target environment is accessible

---

## Next Steps

1. ✅ **Deployment Configured:** Netlify deployment is ready in `.github/workflows/cd.yml`
2. **Add Netlify Secrets:** Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in repository settings (Settings → Secrets and variables → Actions)
3. **Set Up Environments (Optional):** Configure GitHub Environments for staging/production if you want manual approval gates
4. **Add Tests:** Set up test framework and enable test stage in CI
5. **Enable Notifications:** Configure Slack/email notifications if needed
6. **Test Deployment:** Push to `develop` or `main` branch to trigger deployment