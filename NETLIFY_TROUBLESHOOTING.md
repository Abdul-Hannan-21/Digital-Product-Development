# Netlify Deployment Troubleshooting Guide

If changes aren't appearing on your Netlify site, follow these steps:

## 🔍 Step 1: Check Netlify Deploy Logs

1. Go to **Netlify Dashboard**: https://app.netlify.com
2. Select your site
3. Go to **Deploys** tab
4. Check the **latest deploy**:
   - Is it showing your latest commit? (Look for commit `1821c3a`)
   - Is the build **succeeded** or **failed**?
   - Check the build logs for errors

## 🔍 Step 2: Verify Branch Settings

1. Netlify Dashboard → **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Verify:
   - **Production branch**: Should be `main` (or `master`)
   - **Branch deploys**: Should be enabled
   - Repository link is active

## 🔍 Step 3: Verify Build Settings

1. Netlify Dashboard → **Site settings** → **Build & deploy** → **Build settings**
2. Should match your `netlify.toml`:
   - **Build command**: `npm run build` (or leave blank if using netlify.toml)
   - **Publish directory**: `dist` (or leave blank if using netlify.toml)
   - **Base directory**: (usually empty)

**Note**: `netlify.toml` overrides dashboard settings, so they should match.

## 🔍 Step 4: Check Git Integration Status

1. Netlify Dashboard → **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Verify:
   - Repository is connected ✅
   - Branch is `main` ✅
   - "Deploys from main are published automatically" is ON ✅

## 🔍 Step 5: Manual Deploy Test

1. Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. This forces a new build from the latest commit
4. Check if the manual deploy works

## 🔍 Step 6: Clear Cache and Rebuild

1. Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. This clears build cache and rebuilds from scratch

## 🔍 Step 7: Check Build Logs for Errors

In the deploy logs, look for:
- ✅ `Build succeeded` → Build works, check if files are in `dist/`
- ❌ `Build failed` → Check error messages
- ⚠️ `No changes detected` → Netlify thinks nothing changed

Common build errors:
- Missing dependencies → Check `package-lock.json` is committed
- Build command failing → Check `npm run build` works locally
- Missing files → Check `dist/` directory is generated

## 🔍 Step 8: Verify netlify.toml is Correct

Your `netlify.toml` should have:
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Verify it's committed to your repository and pushed to `main`.

## 🔍 Step 9: Check Browser Cache

Sometimes it's just browser caching:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or use Incognito/Private window
3. Clear browser cache

## 🔍 Step 10: Verify Build Output

Check if `dist/` folder contains your changes:
1. Netlify Dashboard → **Deploys** → Latest deploy → **Publish log**
2. Check what files were deployed
3. Verify your changed files are in the `dist/` folder

## Quick Fix Checklist

- [ ] Latest deploy shows your commit (`1821c3a`)
- [ ] Build status is "Published" (not "Failed")
- [ ] Production branch is `main`
- [ ] `netlify.toml` is in the repository root
- [ ] Build logs show no errors
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Cleared Netlify cache and redeployed

## If Still Not Working

1. **Check Netlify Site Activity**: Dashboard → Deploys → See all deploys
2. **Verify Git Push**: Check GitHub → Your repo → Commits → Latest commit is there
3. **Check Build Time**: Recent deploys should show builds after your push
4. **Contact Netlify Support**: If nothing works, check Netlify status or support

---

**Last Updated**: After commit `1821c3a` (Update code changes)
