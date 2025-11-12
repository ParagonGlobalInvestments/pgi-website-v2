# Updated Priority List - Post Migration

**Last Updated:** October 23, 2025  
**Migration Status:** ✅ Completed

---

## 🚨 **CRITICAL PRIORITIES** (Do These Now)

### **~~1. Run Supabase Database Migrations~~** ✅ **COMPLETED**

- **Status:** ✅ DONE
- **What was completed:**
  - Created `pitches` table with all fields
  - Added `exchange` column with constraints
  - Configured Row Level Security policies
  - Set up auto-update triggers
  - All documentation updated

---

### **2. Google OAuth Verification** (Unchanged)

- **Status:** ⏳ WAITING FOR APPROVAL
- **Impact:** HIGH - Users see "unverified app" warning
- **Timeline:** 4-6 weeks for Google review
- **Temporary workaround:** Add member emails as test users
- **Links:** https://console.cloud.google.com/apis/credentials/consent

---

## 🔴 **HIGH PRIORITY** (Next 2-4 Hours)

### **3. Run Pitch Import Script**

- **Status:** ⏳ READY TO RUN (was blocked, now unblocked)
- **Impact:** HIGH - No pitch data will display without this
- **Command:**
  ```bash
  npx tsx scripts/import-pitches.ts
  ```
- **What it does:**
  - Scans `/public/portal-resources/pitches/` folders
  - Parses folder names for ticker, date, exchange
  - Auto-creates pitch entries in Supabase
  - Populates exchange field automatically
- **Requirements:** Resource files must be in place first
- **Estimated Time:** 5 minutes

---

### **4. Upload/Organize Portal Resource Files**

- **Status:** ⏳ NEEDED BEFORE IMPORT SCRIPT
- **Impact:** HIGH - Pages will show "file not found" errors
- **Options:**
  - **A) Automated:** Run `npx tsx scripts/sync-drive-resources.ts` (requires Google Cloud setup)
  - **B) Manual:** Place files in `/public/portal-resources/`
- **Required structure:**
  ```
  /public/portal-resources/
  ├── pitches/value/     (10 pitches: 10 PDFs + 10 Excel)
  ├── pitches/quant/     (ready for future)
  ├── education/value/   (4 PDFs)
  ├── education/quant/   (5 PDFs)
  └── recruitment/       (18 files)
  ```
- **Estimated Time:** 30-60 min (automated) or 2-3 hours (manual)

---

### **5. Complete Pitches Page UI** (70% Done → 100%)

- **Status:** ⏳ IN PROGRESS
- **Impact:** HIGH - Key portal feature incomplete
- **File:** `/src/app/portal/dashboard/pitches/page.tsx`
- **Tasks:**
  - [ ] Add SearchBar component above tabs
  - [ ] Make table headers sortable (click to sort)
  - [ ] Add Exchange badge (NASDAQ/NYSE) to each row
  - [ ] Add "Download All" button to each row
  - [ ] Use filteredValuePitches and filteredQuantPitches
- **Estimated Time:** 1-2 hours

---

### **6. Enhance Pitches Detail Page**

- **Status:** ⏳ INCOMPLETE
- **Impact:** MEDIUM-HIGH - User experience
- **File:** `/src/app/portal/dashboard/pitches/[id]/page.tsx`
- **Tasks:**
  - [ ] Add Exchange badge to header
  - [ ] Add "Download Both Files" button
  - [ ] Update file paths to use database values
  - [ ] Optional: Add performance chart/sparkline
  - [ ] Optional: Add sector/market cap metadata
- **Estimated Time:** 1-2 hours

---

### **7. Enhance Pitches Admin Page**

- **Status:** ⏳ INCOMPLETE
- **Impact:** MEDIUM - Admin workflow efficiency
- **File:** `/src/app/portal/dashboard/pitches/admin/page.tsx`
- **Tasks:**
  - [ ] Add "Auto-Import Pitches" button
  - [ ] Add Exchange field dropdown (NASDAQ/NYSE)
  - [ ] Show file existence indicators
  - [ ] Add preview capabilities
  - [ ] Better validation
- **Estimated Time:** 1-2 hours

---

## 🟡 **MEDIUM PRIORITY** (Next Sprint)

### **8. Migrate Public Resources Page from Google Drive**

- **Status:** ❌ NOT STARTED
- **Impact:** MEDIUM - Technical debt + Google Drive dependency
- **File:** `/src/app/resources/page.tsx`
- **Issue:** Line 3 has `TODO: Remove Google Drive integration`
- **What to do:** Follow portal pages pattern (self-hosted files)
- **Estimated Time:** 2-3 hours

---

### **9. Test All Portal Pages**

- **Status:** ❌ NOT TESTED
- **Impact:** MEDIUM - Quality assurance
- **Checklist:**
  - [ ] Education page loads all 9 PDFs
  - [ ] Recruitment page shows all 18 files
  - [ ] File downloads work
  - [ ] Excel files open in Office Online
  - [ ] Search functionality works on pitches
  - [ ] Sort functionality works on pitches
  - [ ] Exchange badges display correctly
  - [ ] Mobile layout works
  - [ ] Progress tracking persists
  - [ ] Import script populates database
- **Estimated Time:** 30-60 minutes

---

### **10. Codebase Cleanup Tasks**

- **Status:** 🔄 ONGOING
- **Impact:** MEDIUM - Code quality
- **From `/docs/CODEBASE_CLEANUP.md`:**
  - [ ] Remove unused components
  - [ ] Remove dead functions
  - [ ] Clean unused imports
  - [ ] Optimize state management
  - [ ] Remove `any` types
  - [ ] Add JSDoc comments
  - [ ] Implement lazy loading
- **Estimated Time:** 4-6 hours total

---

## 🟢 **LOW PRIORITY** (Future Enhancements)

### **11. Add Progress Tracking to Education Page**

- **Status:** ❌ NOT STARTED
- **Impact:** LOW-MEDIUM - Nice-to-have
- **File:** `/src/app/portal/dashboard/education/page.tsx`
- **Component exists:** `/src/components/portal/ProgressTracker.tsx`
- **Estimated Time:** 1 hour

---

### **12. Enable Feature Flags**

- **Status:** ✅ IMPLEMENTED, ⏳ DISABLED IN PRODUCTION
- **Impact:** LOW - Features work but hidden
- **Flags:**
  - `NEXT_PUBLIC_SHOW_STATS=false` (dashboard stats)
  - `NEXT_PUBLIC_ENABLE_INTERNSHIPS=false` (internships)
- **When to enable:** After thorough testing
- **How:** Set in Vercel environment variables

---

### **13. Optional Future Enhancements**

- **Status:** ❌ NOT STARTED
- **Impact:** LOW - Nice-to-have
- **Ideas:**
  - Add file size display
  - Add "last updated" timestamps
  - Add view/download analytics
  - Add favorites/bookmarks
  - Add bulk download (ZIP)
  - Add PDF preview thumbnails
  - Add cross-portal search
  - Add difficulty filtering
  - Add comments/notes on resources

---

## 📊 **UPDATED SUMMARY**

### Completed:

- ✅ Supabase migrations (pitches table + exchange field)
- ✅ Documentation updates
- ✅ TypeScript interfaces verified
- ✅ Migration tracking documents created

### Next 4 Hours (Recommended Order):

1. ⏳ Upload resource files (30-60 min)
2. ⏳ Run import script (5 min)
3. ⏳ Complete pitches page UI (1-2 hours)
4. ⏳ Test pitches pages (30 min)

### Estimated Total Remaining:

- High Priority: 4-6 hours
- Medium Priority: 6-10 hours
- Low Priority: 4-8 hours
- **Total:** 14-24 hours for all features

### Current Progress:

- **Portal Resources:** 75% complete (was 70%)
- **Overall Project:** ~85% complete for core features

---

## 🎯 **Recommended Action Plan**

### Today (2-4 hours):

1. Upload resource files to `/public/portal-resources/`
2. Run pitch import script
3. Start completing pitches page UI

### This Week:

4. Finish all pitches page enhancements
5. Test all portal pages thoroughly
6. Migrate public resources page

### Next Week:

7. Codebase cleanup
8. Enable feature flags after testing
9. Add progress tracking to education

---

**Status:** Ready to proceed with high-priority tasks  
**Blockers Removed:** ✅ Database migrations complete  
**Next Blocker:** Resource files need to be uploaded


