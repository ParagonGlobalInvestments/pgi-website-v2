# Google OAuth Verification Setup

## 📋 Required Information for Google Cloud Console

Use these exact URLs when configuring your OAuth consent screen:

### **App Information**

- **App name:** `Paragon Global Investments`
- **User support email:** `ap7564@nyu.edu`
- **App logo:** Upload PGI logo (square, 120px x 120px, < 1MB)

### **App Domain URLs**

```
Application home page: https://paragoninvestments.org
Application privacy policy link: https://paragoninvestments.org/privacy
Application terms of service link: https://paragoninvestments.org/terms
```

### **Authorized Domains**

1. `paragoninvestments.org`
2. `hgowpluxzagdzctxbagw.supabase.co`

### **Developer Contact Information**

- Email addresses: `ap7564@nyu.edu`

---

## 🎯 OAuth Scopes Required

When submitting for verification, you'll need to justify these scopes:

### **1. Google Drive API - Metadata Readonly**

```
https://www.googleapis.com/auth/drive.metadata.readonly
```

**Justification:**
"We use this scope to display educational resources from our shared Google Drive folders to verified PGI members. We only read file metadata (names, types, folder structure) to show members what resources are available. We never download or access file contents."

### **2. OpenID & Profile**

```
openid
email
profile
```

**Justification:**
"We use these scopes for user authentication and to verify that users have valid university email addresses (@\*.edu) for PGI membership verification."

---

## 📄 Privacy Policy & Terms Created

✅ **Privacy Policy:** `/src/app/privacy/page.tsx`

- Accessible at: `https://paragoninvestments.org/privacy`
- Covers: Data collection, Google OAuth usage, Drive access, user rights

✅ **Terms of Service:** `/src/app/terms/page.tsx`

- Accessible at: `https://paragoninvestments.org/terms`
- Covers: Acceptable use, member resources, intellectual property

---

## 🚀 Steps to Complete Verification

### **1. Update OAuth Consent Screen**

Go to: [Google Cloud Console - OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)

1. **Edit your app**
2. **Fill in App Information:**

   - App name: `Paragon Global Investments`
   - User support email: `ap7564@nyu.edu`
   - Upload logo (120x120px)

3. **Fill in App Domain:**

   - Application home page: `https://paragoninvestments.org`
   - Privacy policy: `https://paragoninvestments.org/privacy`
   - Terms of service: `https://paragoninvestments.org/terms`

4. **Add Authorized Domains:**

   - `paragoninvestments.org`
   - `hgowpluxzagdzctxbagw.supabase.co`

5. **Developer contact:** `ap7564@nyu.edu`

6. **Save and Continue**

### **2. Configure Scopes**

1. Click "Add or Remove Scopes"
2. Add these scopes:
   - `openid`
   - `email`
   - `profile`
   - `.../auth/drive.metadata.readonly`
3. Save

### **3. Add Test Users (While in Testing)**

Add these emails as test users:

- `ap7564@nyu.edu`
- `anirudh.pottammal@gmail.com` (for testing non-member flow)
- Any other email you want to test with

### **4. Deploy to Production**

1. Deploy your site to Vercel (so the URLs are live)
2. Verify the pages are accessible:
   - ✅ `https://paragoninvestments.org/privacy`
   - ✅ `https://paragoninvestments.org/terms`

### **5. Submit for Verification**

1. Go to "Publishing status"
2. Click "Prepare for verification"
3. Fill out the questionnaire:
   - **What does your app do?** "Paragon Global Investments is a student-run investment organization. Our website provides authenticated members access to educational resources stored in Google Drive."
   - **Why do you need Drive access?** "We use read-only Drive metadata access to display educational materials to verified student members without downloading content."
4. Submit verification request
5. Wait 4-6 weeks for Google review

---

## ⏱️ While Waiting for Verification

Your app will work in "Testing" mode with these limitations:

- ✅ Up to 100 test users
- ✅ Full functionality
- ⚠️ Shows "unverified app" warning
- ⚠️ OAuth tokens expire in 7 days

**Temporary solution:** Keep your app in Testing mode and add PGI member emails as test users.

---

## 📱 What Users See

### **Before Verification**

Users see a warning: "This app hasn't been verified by Google"

- They can click "Advanced" → "Go to [your app]" to proceed

### **After Verification**

- No warning
- Professional consent screen
- Your logo displayed
- Links to privacy policy and terms

---

## 🔒 Security Best Practices

1. ✅ **Minimal Scopes:** Only request `drive.metadata.readonly` (not full `drive.readonly`)
2. ✅ **Clear Purpose:** Privacy policy clearly explains Drive usage
3. ✅ **Member-Only:** Only verified PGI members get Drive access
4. ✅ **No Storage:** We never download or store Drive file contents
5. ✅ **Revocable:** Users can revoke access anytime via Google Account settings

---

## 📞 Support

If Google asks for clarification during review, contact them via the verification process. Be ready to explain:

1. **Your organization:** Student investment group at top universities
2. **Drive usage:** Displaying educational materials to verified student members
3. **Security:** Read-only metadata access, no file content storage
4. **User base:** ~157 active student members across 8 universities

---

## ✅ Checklist

- [ ] Deploy to production (Vercel)
- [ ] Verify privacy policy is live
- [ ] Verify terms of service is live
- [ ] Update OAuth consent screen with URLs
- [ ] Add authorized domains
- [ ] Configure scopes
- [ ] Add test users (for testing phase)
- [ ] Submit verification request
- [ ] Wait for approval (4-6 weeks)

---

**Note:** Keep your app in "Testing" mode and add member emails as test users until verification is approved. This allows full functionality while waiting for Google's review.
