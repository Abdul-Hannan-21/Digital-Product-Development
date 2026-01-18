# Netlify Deployment Verification Checklist

If your pipeline succeeds but changes don't appear on Netlify, follow these steps:

## ✅ Step 1: Verify Netlify is Actually Building

1. Go to **Netlify Dashboard** → Your Site → **Deploys** tab
2. Check the **latest deploy**:
   - Does it show your latest commit SHA? (Check `git log --oneline -1` for the latest)
   - What's the deploy status? (Published, Building, Failed, etc.)
   - Click on the deploy to see build logs

**What to look for:**
- ✅ Latest commit matches your push → Netlify detected changes
- ❌ Old commit shown → Netlify didn't detect your push
- ⚠️ Build failed → Check build logs for errors

## ✅ Step 2: Check Build Logs

In the deploy details, check:
1. **Build command** executed: Should show `npm install && npm run build`
2. **Build output**: Should show "build completed" or "vite build"
3. **Publish directory**: Should list files in `dist/` folder
4. **Any errors**: Red text indicating failures

**Common issues:**
- Build command fails silently
- `dist/` folder empty or missing files
- Build succeeds but files not published

## ✅ Step 3: Verify Git Integration

1. Netlify Dashboard → **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Verify:
   - Repository: `Abdul-Hannan-21/Digital-Product-Development` ✅
   - Production branch: `main` ✅
   - Build hook active: ✅
   - "Deploys from main are published automatically" is ON ✅

## ✅ Step 4: Force Clear Cache and Rebuild

1. Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. This forces a complete rebuild from scratch

**This is the most common fix** - Netlify's cache can hold old files.

## ✅ Step 5: Check Browser Cache

Your browser might be showing cached content:
1. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Incognito/Private window**: Visit your site to bypass cache
3. **Clear browser cache**: Clear site data for your Netlify domain

## ✅ Step 6: Verify Build Output

Check what Netlify is actually deploying:

1. In deploy logs, look for "Publish directory" or "Files uploaded"
2. Should show files like:
   - `index.html`
   - `assets/` folder with JS/CSS files
   - Other static assets

If `dist/` is empty, the build isn't producing output correctly.

## ✅ Step 7: Check netlify.toml is Being Used

In build logs, you should see:
```
Config file: /opt/build/repo/netlify.toml
```

This confirms Netlify is reading your `netlify.toml` file.

## 🔧 Quick Fixes to Try

### Fix 1: Clear Cache and Redeploy
```
Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy site
```

### Fix 2: Verify Latest Commit is Deployed
```
1. Check latest commit: git log --oneline -1
2. In Netlify Deploys → Check if that commit SHA matches
```

### Fix 3: Check Build Command Output
In Netlify build logs, verify:
- `npm install` completes successfully
- `npm run build` completes successfully  
- Files are generated in `dist/` directory

### Fix 4: Verify Publish Directory
In Netlify build logs, check:
```
Published /opt/build/repo/dist
```
Should list your HTML, JS, CSS files.

## 🐛 If Still Not Working

1. **Check Netlify Build Settings**:
   - Site settings → Build & deploy → Build settings
   - Build command: Should match `netlify.toml` or be blank (uses netlify.toml)
   - Publish directory: Should match `netlify.toml` or be blank

2. **Check File Permissions**:
   - Make sure all files in `dist/` are readable
   - `index.html` should exist and be the entry point

3. **Check for Build Errors**:
   - Even if deploy shows "Published", check for warnings
   - Look for "failed" or "error" messages in logs

4. **Manual Deploy Test**:
   - Netlify Dashboard → Deploys → Trigger deploy → Deploy site
   - This bypasses Git integration to test if build works

## 📋 Verification Checklist

- [ ] Latest deploy shows your latest commit SHA
- [ ] Build status is "Published" (green checkmark)
- [ ] Build logs show `npm install && npm run build` completing
- [ ] Build logs show files in `dist/` directory
- [ ] Hard refresh browser (Ctrl+Shift+R) - changes appear
- [ ] Checked in incognito window - changes appear
- [ ] Cleared Netlify cache and redeployed

---

**Most Common Solution**: "Clear cache and deploy site" fixes 80% of these issues.
