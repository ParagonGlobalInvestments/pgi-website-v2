# mobile document viewer - deployment guide

## 📦 what was built

### production-ready files:
✅ `src/components/portal/MobileDocumentViewer.tsx` - main mobile viewer component
✅ `src/hooks/useIsMobile.ts` - mobile detection hook
✅ `src/app/portal/dashboard/pitches/[id]/page.tsx` - updated pitches page
✅ `src/components/drive/BentoFolderGrid.tsx` - updated resources page
✅ `package.json` - added xlsx dependency

### test files (optional - can delete before deploy):
⚠️ `src/app/test-viewer/page.tsx` - test page
⚠️ `src/app/test-comparison/page.tsx` - comparison demo
⚠️ `src/app/test-dual/page.tsx` - dual test page
⚠️ `scripts/add-test-pitch-urls.ts` - helper script

## 🎯 what it does

### desktop (>= 768px wide):
- **no change** - iframes work exactly as before
- backwards compatible with existing setup

### mobile (< 768px wide):
- **pitches page**: shows button cards instead of iframes → opens mobile-optimized viewer
- **resources page**: opens documents in mobile viewer instead of new tab
- **features**: download, open in drive, smooth scrolling, clean ui

## 🚀 deployment steps

### step 1: verify changes locally
```bash
# make sure dev server is running
npm run dev

# test in browser (use chrome devtools mobile emulation)
# 1. press F12 → device toggle (Cmd+Shift+M)
# 2. select iPhone or Pixel device
# 3. navigate to /portal/dashboard/pitches
# 4. click any pitch → should see button cards
```

### step 2: check your branch
```bash
# see current branch
git branch

# if not on your branch, create one:
git checkout -b feature/mobile-document-viewer
```

### step 3: commit changes
```bash
# see what changed
git status

# stage all changes
git add .

# commit with clear message
git commit -m "feat: add mobile-optimized document viewer

- Add MobileDocumentViewer component for pdfs and excel files
- Add useIsMobile hook for responsive detection
- Update pitches page with mobile-friendly button cards
- Update resources page with mobile viewer
- Desktop behavior unchanged (backwards compatible)
- Mobile users get optimized viewing experience

closes #[issue-number-if-any]"
```

### step 4: push to your branch
```bash
# push to remote (creates preview deployment)
git push origin feature/mobile-document-viewer
```

### step 5: get your preview url

vercel will automatically deploy your branch. you'll get a preview url like:
```
https://pgi-website-v2-feature-mobile-document-viewer-[unique-id].vercel.app
```

find it at: https://vercel.com/dashboard → select your project → deployments

### step 6: test on preview url

1. open preview url on your phone
2. login to portal
3. go to pitches page
4. click any pitch with documents
5. verify mobile viewer works

### step 7: open pr for review

once preview looks good:

1. go to github: https://github.com/PGI-ORG/pgi-website-v2
2. you'll see a banner "compare & pull request"
3. click it and fill out:

**title:**
```
feat: Mobile-Optimized Document Viewer for Pitches & Resources
```

**description:**
```markdown
## Summary
Adds mobile-responsive document viewer for pitch PDFs/Excel models and resource files. Desktop behavior unchanged.

## What Changed
- ✅ New MobileDocumentViewer component (PDF + Excel support)
- ✅ Pitches detail page: mobile shows buttons → opens viewer
- ✅ Resources page: mobile opens files in viewer
- ✅ Desktop: iframes work exactly as before (backwards compatible)
- ✅ Dependencies: added xlsx for excel parsing

## How to Test
### Desktop:
1. Navigate to any pitch with documents
2. Should see iframes as before (no change)

### Mobile (or chrome devtools mobile emulation):
1. F12 → device toggle (Cmd+Shift+M) → select mobile device
2. Navigate to pitches → click any pitch
3. Should see button cards instead of iframes
4. Click "view pdf" or "view excel"
5. Should open clean mobile viewer with:
   - Download button
   - Open in Drive button
   - Smooth scrolling
   - Full-screen layout

## Preview URL
[paste your vercel preview url here]

## Screenshots
[optional: add screenshots of mobile viewer]

## Notes for Reviewers
- No database changes needed
- Works with existing google drive urls
- Falls back gracefully if files missing
- Test pages included (can delete): /test-viewer, /test-comparison, /test-dual
```

4. assign to @ani and @alej for review
5. they can test on the preview url before merging

## 📝 testing checklist for reviewers

### ✅ desktop testing:
- [ ] pitches page loads normally
- [ ] clicking pitch shows iframes (unchanged)
- [ ] pdf/excel display in iframes as before
- [ ] no visual regressions

### ✅ mobile testing (use chrome devtools or real phone):
- [ ] pitches page shows table/cards
- [ ] clicking pitch shows button cards (not iframes)
- [ ] "view pdf" button opens mobile viewer
- [ ] "view excel" button opens mobile viewer
- [ ] viewer has download button
- [ ] viewer has "open in drive" button
- [ ] close button works
- [ ] pdf loads and displays correctly
- [ ] excel loads and displays as table
- [ ] performance is acceptable

### ✅ resources page testing:
- [ ] desktop: clicking file opens in new tab (unchanged)
- [ ] mobile: clicking file opens in mobile viewer

## 🔧 if issues found

common issues and fixes:

### "file doesn't load in viewer"
- check if file is shared publicly ("anyone with link")
- verify url format: `https://drive.google.com/file/d/FILE_ID/view`

### "viewer doesn't open on mobile"
- check window width (must be < 768px)
- try hard refresh (Cmd+Shift+R)
- check browser console for errors

### "desktop shows buttons instead of iframes"
- window width might be < 768px
- resize to wider and refresh

## 📊 impact

**before:**
- mobile users saw tiny, unusable iframes
- had to download files to view properly
- poor ux on phones

**after:**
- mobile users get clean, native-feeling viewer
- can view docs directly in portal
- download option still available
- desktop unchanged

## 🎉 ready to merge?

once ani/alej approve:
1. they'll merge to main
2. vercel auto-deploys to production
3. mobile users immediately get better experience

## 📞 questions?

reach out to the implementer or check:
- implementation details in component files
- test pages: /test-viewer, /test-comparison
- this guide: /DEPLOYMENT_GUIDE.md
