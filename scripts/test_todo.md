## **Comprehensive Testing Plan for Production**

### **🔐 Authentication Flow Tests**

1. **Sign In (`/sign-in`)**

   ```
   ✅ Test: Visit /sign-in
   ✅ Test: Click "Continue with University Google Account"
   ✅ Test: Google OAuth flow works
   ✅ Test: .edu email validation (reject @gmail.com)
   ✅ Test: Successful redirect to /resources
   ✅ Test: User created in Supabase database
   ✅ Test: Session persists on page refresh
   ```

2. **Sign Up (`/sign-up`)**

   ```
   ✅ Test: Similar flow to sign-in
   ✅ Test: First-time user gets proper onboarding
   ✅ Test: User data properly synced to Supabase
   ```

3. **Sign Out**
   ```
   ✅ Test: Header sign-out button works
   ✅ Test: Session cleared completely
   ✅ Test: Redirect to home page
   ✅ Test: Can't access protected routes after sign-out
   ```

### **🛡️ Access Control Tests**

4. **Resources Page (`/resources`)**

   ```
   ✅ Test: Unauthenticated users see preview + sign-in CTA
   ✅ Test: .edu authenticated users see full resources
   ✅ Test: Non-.edu users get rejection message + switch account
   ✅ Test: Google Drive integration works for valid users
   ✅ Test: BentoFolderGrid loads properly
   ```

5. **Member Portal (`/portal/*`)**
   ```
   ✅ Test: Requires authentication (redirects if not signed in)
   ✅ Test: Dashboard loads with correct user data
   ✅ Test: Permission levels work (admin/lead/member)
   ✅ Test: All subpages work: /portal/dashboard/*, /portal/settings, etc.
   ✅ Test: User profile data displays correctly
   ```

### **🔌 API Integration Tests**

6. **User API Routes**

   ```
   ✅ Test: GET /api/users/me - Returns current user data
   ✅ Test: POST /api/users/sync - Syncs user data properly
   ✅ Test: GET /api/users/stats - Returns user statistics
   ✅ Test: PUT /api/users/[userId] - Updates user (admin only)
   ```

7. **Other API Routes**
   ```
   ✅ Test: GET /api/chapters - Returns chapters list
   ✅ Test: GET /api/internships - Returns internships
   ✅ Test: POST /api/rss-items/refresh - Admin can refresh RSS (auth check)
   ```

### **🧹 Clerk Removal Verification**

8. **No Clerk Dependencies**
   ```
   ✅ Test: No @clerk imports anywhere
   ✅ Test: No Clerk components in use
   ✅ Test: No Clerk environment variables needed
   ✅ Test: All auth flows use Supabase
   ```
