# MongoDB Atlas Connection Fix & Image Upload Issue Resolution

## Issue Description
When attempting to upload destination images in the Admin Portal, the error "Failed to upload all.webp image upload failed" appears. This is caused by MongoDB Atlas connection issues during authentication middleware execution.

## Root Cause
The `requireAdmin` middleware in `/lib/rbac.js` attempts to connect to MongoDB Atlas to verify admin privileges. If the connection fails, the image upload API endpoint returns a 503 or 401 error before the actual upload can occur.

## Fixes Applied

### 1. Improved MongoDB Connection String
**File:** `.env.local`

Added MongoDB Atlas connection options for better reliability:
```env
MONGODB_URI=mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB?retryWrites=true&w=majority
```

**Changes:**
- Added `retryWrites=true` for automatic retry on write failures
- Added `w=majority` for write concern (ensures data is written to majority of replica set members)

### 2. Removed Hardcoded Fallback URI
**File:** `lib/mongodb.js`

**Before:**
```javascript
const uri = process.env.MONGODB_URI || 'mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB';
```

**After:**
```javascript
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    'Database configuration missing: MONGODB_URI environment variable is not defined. Please set MONGODB_URI in your .env.local file.'
  );
}
```

**Reason:** Ensures environment variable is always loaded correctly, preventing confusion with hardcoded values.

### 3. Updated Seed Script
**File:** `scripts/seed-admin.mjs`

Updated the fallback connection string to include the new Atlas options for consistency.

### 4. Added Diagnostic Tools
Created two new test scripts for debugging:

#### a. Database Connection Test
**File:** `scripts/test-db-connection.mjs`

Run with:
```bash
node scripts/test-db-connection.mjs
```

Tests MongoDB Atlas connectivity, lists collections, and diagnoses connection errors.

#### b. Image Upload Test
**File:** `scripts/test-image-upload.mjs`

Run with:
```bash
node scripts/test-image-upload.mjs
```

Tests the image upload API endpoint (requires authentication).

## Troubleshooting Steps

### If Image Upload Still Fails:

#### 1. Check MongoDB Atlas Network Access
Your IP address must be whitelisted in MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Navigate to **Network Access** in the left sidebar
3. Click **Add IP Address**
4. Either:
   - Add your current IP address
   - Or allow access from anywhere (0.0.0.0/0) for testing (NOT recommended for production)

#### 2. Verify Cluster is Active
1. Go to https://cloud.mongodb.com
2. Navigate to **Database** → **Clusters**
3. Ensure `cluster0` is in **Active** state (not paused or suspended)

#### 3. Test Database Connection
```bash
node scripts/test-db-connection.mjs
```

Expected output:
```
✅ Successfully connected to MongoDB Atlas!
📊 Database name: heritageDB
📁 Collections found: 5
```

#### 4. Restart Development Server
After any `.env.local` changes, always restart the server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

#### 5. Clear Browser Cache
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or use incognito/private browsing mode

#### 6. Check Admin Authentication
Ensure you're logged in as an admin:
- Email: `admin@virasat.gov.in`
- Password: `Virasat@Admin2026!`

To recreate admin user:
```bash
node scripts/seed-admin.mjs
```

## Verify the Fix

### Step-by-Step Verification

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test database connection:**
   ```bash
   node scripts/test-db-connection.mjs
   ```
   Should show ✅ Successfully connected

3. **Login to admin portal:**
   - Navigate to: http://localhost:3000/login
   - Email: admin@virasat.gov.in
   - Password: Virasat@Admin2026!

4. **Navigate to a heritage site:**
   - Click **Destinations (Sites)** in the sidebar
   - Click on any heritage site
   - Click **Edit Monument** button

5. **Test image upload:**
   - Scroll to **Destination Images** section
   - Click **Upload Primary Image** or **Add Gallery Images**
   - Select a JPEG, PNG, or WebP image (max 5MB)
   - Should show green success message: "Primary destination image uploaded"

## Technical Details

### Authentication Flow
```
User uploads image
  → Frontend calls /api/admin/sites/upload-image
    → requireAdmin() middleware
      → connectToDatabase() 
        → Validates MongoDB Atlas connection
      → Verifies JWT token
      → Checks user role === 'admin'
    → If auth passes:
      → Validates image buffer (magic bytes check)
      → Saves to public/uploads/destinations/
      → Returns success with image URL
```

### Error Codes
- **401 UNAUTHENTICATED**: No valid JWT token (not logged in)
- **403 FORBIDDEN_ADMIN_REQUIRED**: User is not an admin
- **503 DATABASE_UNAVAILABLE**: MongoDB Atlas unreachable
- **400 INVALID_IMAGE_FILE**: File is not a valid image
- **400 FILE_TOO_LARGE**: Image exceeds 5MB limit

## Environment Variables Reference

Required in `.env.local`:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://anvaya123:kQfoUfl02QP3rP1E@cluster0.dlekiba.mongodb.net/heritageDB?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=heritage_secret_key_jwt_authentication_token_2026_super_secure

# Optional: AWS S3 for production (local filesystem used by default)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA_LOCAL_DEV_KEY
AWS_SECRET_ACCESS_KEY=LOCAL_DEV_SECRET_KEY
AWS_S3_BUCKET_NAME=heritage-site-media-local
```

## Common Errors & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Database service is currently unreachable" | MongoDB Atlas not reachable | Check network access whitelist |
| "Failed to upload all.webp image upload failed" | Generic upload failure | Check server logs, verify auth |
| "Authentication required" | Not logged in | Login as admin |
| "Exclusive administrator privileges required" | Logged in as visitor | Login with admin account |
| "File size exceeds maximum allowed limit" | Image > 5MB | Resize or compress image |
| "Invalid image format" | Wrong file type | Use JPEG, PNG, or WebP |

## Additional Resources

- MongoDB Atlas Dashboard: https://cloud.mongodb.com
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
- Mongoose Connection Options: https://mongoosejs.com/docs/connections.html

## Contact & Support

If issues persist after following these steps:
1. Check the browser console for JavaScript errors
2. Check the server terminal for Node.js errors
3. Run the diagnostic scripts
4. Verify all environment variables are set correctly

## Recent Changes (Commit 2cad93e)

- ✅ Removed hardcoded MongoDB URI fallback in `lib/mongodb.js`
- ✅ Added `retryWrites=true&w=majority` to connection string
- ✅ Created `test-db-connection.mjs` diagnostic script
- ✅ Created `test-image-upload.mjs` diagnostic script
- ✅ Updated `seed-admin.mjs` connection string
- ✅ Pushed to both origin and heritage repositories
