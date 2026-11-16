import mongoose from 'mongoose';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3015';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/heritageDB?replicaSet=rs0';

// Minimal valid JPEG binary buffer (with standard JPEG SOI and APP0 headers)
function createValidJpegBuffer() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);
}

// Minimal valid PNG buffer
function createValidPngBuffer() {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
    0x42, 0x60, 0x82
  ]);
}

// Minimal valid WebP buffer
function createValidWebpBuffer() {
  const header = Buffer.from('RIFF', 'ascii');
  const size = Buffer.alloc(4);
  const webp = Buffer.from('WEBPVP8 ', 'ascii');
  const vp8Payload = Buffer.from([
    0x08, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00
  ]);
  const total = Buffer.concat([header, size, webp, vp8Payload]);
  total.writeUInt32LE(total.length - 8, 4);
  return total;
}

export async function runDestinationImagesAudit() {
  console.log('================================================================');
  console.log('ANVAYA: DESTINATION IMAGE MANAGEMENT & PUBLIC INTEGRATION AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function recordPass(desc) {
    passed++;
    console.log(`[PASS] ${desc}`);
  }

  function recordFail(desc, err) {
    failed++;
    console.error(`[FAIL] ${desc}:`, err?.message || err);
  }

  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  const sitesCollection = db.collection('heritagesites');

  // Track created storage files to ensure clean up
  const createdStorageKeys = [];

  try {
    // -------------------------------------------------------------
    // SETUP: Provision Test Admin and Visitor Sessions
    // -------------------------------------------------------------
    console.log('--- SETUP: Provisioning Test Admin, Visitor & Staff Sessions ---');
    const ts = Date.now();
    const adminEmail = `img-admin-${ts}@anvaya.gov.in`;
    const visitorEmail = `img-visitor-${ts}@anvaya.test`;
    const staffEmail = `img-staff-${ts}@anvaya.gov.in`;

    async function registerUser(name, email, role = 'visitor') {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: 'Password123!',
          phone: '+919876543210',
        }),
      });
      const cookie = res.headers.get('set-cookie')?.split(';')[0] || '';
      const data = await res.json();
      const userId = data.data?.user?.id;

      if (role !== 'visitor' && userId) {
        await usersCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { role } }
        );
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: 'Password123!' }),
        });
        const newCookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
        return { cookie: newCookie, userId, email, name };
      }

      return { cookie, userId, email, name };
    }

    const visitor = await registerUser('Image Visitor', visitorEmail, 'visitor');
    const admin = await registerUser('Chief Custodian', adminEmail, 'admin');
    const staff = await registerUser('Heritage Staff', staffEmail, 'staff');

    recordPass(`Provisioned test users: Admin (${admin.email}), Visitor (${visitor.email}), Staff (${staff.email})`);

    // -------------------------------------------------------------
    // SUITE 1: RBAC & Access Control on Image Upload Endpoint
    // -------------------------------------------------------------
    console.log('\n--- SUITE 1: Strict RBAC on /api/admin/sites/upload-image ---');

    // 1.1 Unauthenticated request should be rejected (401)
    {
      const formData = new FormData();
      const blob = new Blob([createValidJpegBuffer()], { type: 'image/jpeg' });
      formData.append('file', blob, 'test.jpg');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        body: formData,
      });

      assert.strictEqual(res.status, 401, 'Unauthenticated upload must return 401');
      recordPass('1.1 Unauthenticated upload request rejected with 401 Unauthorized');
    }

    // 1.2 Visitor request should be forbidden (403)
    {
      const formData = new FormData();
      const blob = new Blob([createValidJpegBuffer()], { type: 'image/jpeg' });
      formData.append('file', blob, 'test.jpg');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: visitor.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 403, 'Visitor upload must return 403 Forbidden');
      recordPass('1.2 Visitor upload request rejected with 403 Forbidden');
    }

    // 1.3 Staff request should be forbidden (403 - Admin only)
    {
      const formData = new FormData();
      const blob = new Blob([createValidJpegBuffer()], { type: 'image/jpeg' });
      formData.append('file', blob, 'test.jpg');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: staff.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 403, 'Staff upload must return 403 Forbidden');
      recordPass('1.3 Staff upload request rejected with 403 Forbidden (Strict Admin RBAC)');
    }

    // -------------------------------------------------------------
    // SUITE 2: Image File Validation & Magic Byte Security
    // -------------------------------------------------------------
    console.log('\n--- SUITE 2: Image Security & Magic Byte Inspection ---');

    // 2.1 Rejects malicious text/script pretending to be JPG
    {
      const fakeJpg = Buffer.from('<?php echo "malicious code"; ?> <script>alert(1)</script>');
      const formData = new FormData();
      const blob = new Blob([fakeJpg], { type: 'image/jpeg' });
      formData.append('file', blob, 'fake-exploit.jpg');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 400, 'Fake JPG with executable/script bytes must be rejected with 400');
      const data = await res.json();
      assert.strictEqual(data.code, 'INVALID_IMAGE_FILE');
      recordPass('2.1 Malicious script with fake .jpg extension blocked by magic byte analysis');
    }

    // 2.2 Rejects executable header (MZ) disguised as PNG
    {
      const fakeExe = Buffer.from('MZ\x90\x00\x03\x00\x00\x00Windows Executable Stub');
      const formData = new FormData();
      const blob = new Blob([fakeExe], { type: 'image/png' });
      formData.append('file', blob, 'trojan.png');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 400, 'Executable disguised as PNG must return 400');
      const data = await res.json();
      assert.strictEqual(data.code, 'INVALID_IMAGE_FILE');
      recordPass('2.2 Executable binary (MZ) disguised as .png rejected by magic byte detection');
    }

    // 2.3 Rejects files exceeding 5MB limit
    {
      // 5.5 MB dummy buffer
      const oversized = Buffer.alloc(5.5 * 1024 * 1024);
      oversized[0] = 0xff;
      oversized[1] = 0xd8;
      oversized[2] = 0xff; // fake jpeg header
      const formData = new FormData();
      const blob = new Blob([oversized], { type: 'image/jpeg' });
      formData.append('file', blob, 'huge-monument.jpg');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 400, 'Oversized image must return 400');
      const data = await res.json();
      assert.strictEqual(data.code, 'FILE_TOO_LARGE');
      recordPass('2.3 Oversized image (>5MB) rejected with FILE_TOO_LARGE error');
    }

    // 2.4 Missing file payload
    {
      const formData = new FormData();
      formData.append('destinationName', 'Taj Mahal');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.strictEqual(res.status, 400, 'Missing file must return 400');
      recordPass('2.4 Missing file form-data payload returns 400 Bad Request');
    }

    // -------------------------------------------------------------
    // SUITE 3: Valid Image Uploads (JPEG, PNG, WebP)
    // -------------------------------------------------------------
    console.log('\n--- SUITE 3: Valid Image Uploads & Metadata Generation ---');

    let uploadedJpegMeta = null;
    let uploadedPngMeta = null;
    let uploadedWebpMeta = null;

    // 3.1 Upload valid JPEG
    {
      const formData = new FormData();
      const blob = new Blob([createValidJpegBuffer()], { type: 'image/jpeg' });
      formData.append('file', blob, 'ajanta-fresco-sample.jpg');
      formData.append('destinationName', 'Ajanta Caves');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.ok(res.status === 200 || res.status === 201, 'Valid JPEG upload must succeed');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.url, 'Upload must return public url');
      assert.ok(data.data.storageKey, 'Upload must return storageKey');
      assert.strictEqual(data.data.mimeType, 'image/jpeg');
      assert.ok(data.data.storageKey.includes('dest-'), 'storageKey must contain dest- prefix');

      uploadedJpegMeta = data.data;
      createdStorageKeys.push(uploadedJpegMeta.storageKey);

      // Verify file exists on local disk
      const localFilePath = path.join(process.cwd(), 'public', uploadedJpegMeta.url.replace(/^\//, ''));
      assert.ok(fs.existsSync(localFilePath), `Uploaded file must physically exist at ${localFilePath}`);
      recordPass(`3.1 Valid JPEG uploaded successfully: ${uploadedJpegMeta.url} (${uploadedJpegMeta.storageKey})`);
    }

    // 3.2 Upload valid PNG
    {
      const formData = new FormData();
      const blob = new Blob([createValidPngBuffer()], { type: 'image/png' });
      formData.append('file', blob, 'ajanta-monastery-cave.png');
      formData.append('destinationName', 'Ajanta Caves');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.ok(res.status === 200 || res.status === 201, 'Valid PNG upload must succeed');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.mimeType, 'image/png');

      uploadedPngMeta = data.data;
      createdStorageKeys.push(uploadedPngMeta.storageKey);
      recordPass(`3.2 Valid PNG uploaded successfully: ${uploadedPngMeta.url}`);
    }

    // 3.3 Upload valid WebP
    {
      const formData = new FormData();
      const blob = new Blob([createValidWebpBuffer()], { type: 'image/webp' });
      formData.append('file', blob, 'ajanta-sculpture.webp');
      formData.append('destinationName', 'Ajanta Caves');

      const res = await fetch(`${BASE_URL}/api/admin/sites/upload-image`, {
        method: 'POST',
        headers: { Cookie: admin.cookie },
        body: formData,
      });

      assert.ok(res.status === 200 || res.status === 201, 'Valid WebP upload must succeed');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.mimeType, 'image/webp');

      uploadedWebpMeta = data.data;
      createdStorageKeys.push(uploadedWebpMeta.storageKey);
      recordPass(`3.3 Valid WebP uploaded successfully: ${uploadedWebpMeta.url}`);
    }

    // -------------------------------------------------------------
    // SUITE 4: Monument Image Management & Schema Integration
    // -------------------------------------------------------------
    console.log('\n--- SUITE 4: Monument Image Management & Audit Trail Logging ---');

    // Find Ajanta Caves site in DB
    const ajantaDoc = await sitesCollection.findOne({ slug: 'ajanta-caves' });
    assert.ok(ajantaDoc, 'Ajanta Caves monument must exist in database');
    const siteId = ajantaDoc._id.toString();
    const originalImage = ajantaDoc.image || ajantaDoc.images?.[0];
    const originalGallery = ajantaDoc.gallery || [];

    // 4.1 Update Ajanta Caves with new primary image and gallery
    {
      const updatePayload = {
        image: uploadedJpegMeta.url,
        primaryImageMetadata: {
          url: uploadedJpegMeta.url,
          storageKey: uploadedJpegMeta.storageKey,
          caption: 'Ajanta Cave 1 Main Fresco and Bodhisattva Padmapani',
          alt: 'Ancient rock-cut Buddhist prayer hall and mural painting in Cave 1',
          source: 'ADMIN_UPLOAD',
          uploadedAt: new Date().toISOString(),
        },
        gallery: [
          {
            url: uploadedPngMeta.url,
            storageKey: uploadedPngMeta.storageKey,
            caption: 'Monastery Vihara Entrance Hall',
            alt: 'Carved stone pillars leading into Buddhist vihara cell',
            order: 0,
            filename: uploadedPngMeta.filename,
            size: uploadedPngMeta.size,
            mimeType: uploadedPngMeta.mimeType,
          },
          {
            url: uploadedWebpMeta.url,
            storageKey: uploadedWebpMeta.storageKey,
            caption: 'Chaitya Hall Stupa and Barrel-Vaulted Ceiling',
            alt: 'Rock-cut Chaityagriha with monolithic stupa and ribbed roof',
            order: 1,
            filename: uploadedWebpMeta.filename,
            size: uploadedWebpMeta.size,
            mimeType: uploadedWebpMeta.mimeType,
          },
        ],
      };

      const putRes = await fetch(`${BASE_URL}/api/admin/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: admin.cookie,
        },
        body: JSON.stringify(updatePayload),
      });

      assert.strictEqual(putRes.status, 200, 'Admin site update with image payload must succeed');
      const putData = await putRes.json();
      assert.strictEqual(putData.success, true);
      assert.strictEqual(putData.data.image, uploadedJpegMeta.url);
      assert.strictEqual(putData.data.gallery.length, 2);

      // Verify in MongoDB directly
      const updatedInDb = await sitesCollection.findOne({ _id: new mongoose.Types.ObjectId(siteId) });
      assert.strictEqual(updatedInDb.image, uploadedJpegMeta.url);
      assert.strictEqual(updatedInDb.primaryImageMetadata.caption, 'Ajanta Cave 1 Main Fresco and Bodhisattva Padmapani');
      assert.strictEqual(updatedInDb.gallery.length, 2);
      assert.strictEqual(updatedInDb.gallery[0].storageKey, uploadedPngMeta.storageKey);
      assert.strictEqual(updatedInDb.gallery[1].storageKey, uploadedWebpMeta.storageKey);

      // Verify audit log entry was appended
      assert.ok(Array.isArray(updatedInDb.imageAuditLog), 'imageAuditLog must be an array');
      const lastAudit = updatedInDb.imageAuditLog[updatedInDb.imageAuditLog.length - 1];
      assert.ok(lastAudit, 'Audit log must have at least one entry');
      assert.strictEqual(lastAudit.adminEmail, admin.email);
      assert.strictEqual(lastAudit.action, 'PRIMARY_IMAGE_UPDATED');
      recordPass('4.1 Admin successfully updated primary image, metadata and gallery with audit log entry');
    }

    // 4.2 Reordering Gallery Images
    {
      // Swap order 0 and 1
      const reorderPayload = {
        gallery: [
          {
            url: uploadedWebpMeta.url,
            storageKey: uploadedWebpMeta.storageKey,
            caption: 'Chaitya Hall Stupa and Barrel-Vaulted Ceiling',
            alt: 'Rock-cut Chaityagriha with monolithic stupa and ribbed roof',
            order: 0,
            filename: uploadedWebpMeta.filename,
            size: uploadedWebpMeta.size,
            mimeType: uploadedWebpMeta.mimeType,
          },
          {
            url: uploadedPngMeta.url,
            storageKey: uploadedPngMeta.storageKey,
            caption: 'Monastery Vihara Entrance Hall',
            alt: 'Carved stone pillars leading into Buddhist vihara cell',
            order: 1,
            filename: uploadedPngMeta.filename,
            size: uploadedPngMeta.size,
            mimeType: uploadedPngMeta.mimeType,
          },
        ],
      };

      const putRes = await fetch(`${BASE_URL}/api/admin/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: admin.cookie,
        },
        body: JSON.stringify(reorderPayload),
      });

      assert.strictEqual(putRes.status, 200, 'Gallery reordering update must return 200');
      const updatedInDb = await sitesCollection.findOne({ _id: new mongoose.Types.ObjectId(siteId) });
      assert.strictEqual(updatedInDb.gallery[0].storageKey, uploadedWebpMeta.storageKey);
      assert.strictEqual(updatedInDb.gallery[0].order, 0);
      assert.strictEqual(updatedInDb.gallery[1].storageKey, uploadedPngMeta.storageKey);
      assert.strictEqual(updatedInDb.gallery[1].order, 1);
      recordPass('4.2 Gallery image reordering persisted and verified');
    }

    // 4.3 Setting a Gallery Image as Primary
    {
      const setPrimaryPayload = {
        image: uploadedWebpMeta.url,
        primaryImageMetadata: {
          url: uploadedWebpMeta.url,
          storageKey: uploadedWebpMeta.storageKey,
          caption: 'Chaitya Hall Stupa (Selected as Primary)',
          alt: 'Primary Chaityagriha View',
          source: 'GALLERY_PROMOTED',
        },
      };

      const putRes = await fetch(`${BASE_URL}/api/admin/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: admin.cookie,
        },
        body: JSON.stringify(setPrimaryPayload),
      });

      assert.strictEqual(putRes.status, 200, 'Promoting gallery image to primary must return 200');
      const updatedInDb = await sitesCollection.findOne({ _id: new mongoose.Types.ObjectId(siteId) });
      assert.strictEqual(updatedInDb.image, uploadedWebpMeta.url);
      assert.strictEqual(updatedInDb.primaryImageMetadata.source, 'GALLERY_PROMOTED');
      recordPass('4.3 Setting gallery item as primary image persisted and tracked');
    }

    // 4.4 Removing an image from gallery
    {
      const removeGalleryItemPayload = {
        gallery: [
          {
            url: uploadedPngMeta.url,
            storageKey: uploadedPngMeta.storageKey,
            caption: 'Monastery Vihara Entrance Hall',
            alt: 'Carved stone pillars leading into Buddhist vihara cell',
            order: 0,
            filename: uploadedPngMeta.filename,
            size: uploadedPngMeta.size,
            mimeType: uploadedPngMeta.mimeType,
          },
        ],
      };

      const putRes = await fetch(`${BASE_URL}/api/admin/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: admin.cookie,
        },
        body: JSON.stringify(removeGalleryItemPayload),
      });

      assert.strictEqual(putRes.status, 200);
      const updatedInDb = await sitesCollection.findOne({ _id: new mongoose.Types.ObjectId(siteId) });
      assert.strictEqual(updatedInDb.gallery.length, 1);
      assert.strictEqual(updatedInDb.gallery[0].storageKey, uploadedPngMeta.storageKey);
      recordPass('4.4 Individual gallery item deletion persisted and verified');
    }

    // -------------------------------------------------------------
    // SUITE 5: Public Portal Dynamic Reflection
    // -------------------------------------------------------------
    console.log('\n--- SUITE 5: Public Portal Live Image Dynamic Reflection ---');

    // 5.1 Public GET /api/sites returns live DB image
    {
      const pubRes = await fetch(`${BASE_URL}/api/sites`);
      assert.strictEqual(pubRes.status, 200, 'Public /api/sites must return 200');
      const pubData = await pubRes.json();
      assert.strictEqual(pubData.success, true);
      assert.ok(Array.isArray(pubData.data?.sites), 'pubData.data.sites must be an array');
      assert.strictEqual(pubData.data.sites.length, 5, 'Must contain exactly 5 verified destinations');

      const ajantaPublic = pubData.data.sites.find((s) => s.slug === 'ajanta-caves');
      assert.ok(ajantaPublic, 'Ajanta Caves must be in public catalog');
      assert.strictEqual(ajantaPublic.image, uploadedWebpMeta.url, 'Public catalog must reflect live DB image');
      recordPass('5.1 Public /api/sites returns dynamic admin-managed destination image for Ajanta Caves');
    }

    // 5.2 Public GET /api/sites?slug=ajanta-caves live destination query
    {
      const slugRes = await fetch(`${BASE_URL}/api/sites?slug=ajanta-caves`);
      assert.strictEqual(slugRes.status, 200, 'Slug query must return 200');
      const slugData = await slugRes.json();
      assert.strictEqual(slugData.success, true);
      assert.ok(slugData.data?.site, 'Slug query must return site object');
      assert.strictEqual(slugData.data.site.image, uploadedWebpMeta.url, 'Server resolver must prioritize DB image');
      recordPass('5.2 Destination endpoint /api/sites?slug=ajanta-caves prioritizes database image over static fallback');
    }

    // 5.3 Verify other 4 heritage sites remain functional with verified imagery
    {
      const requiredSites = ['taj-mahal', 'red-fort', 'qutub-minar', 'hampi'];
      for (const slug of requiredSites) {
        const siteDoc = await sitesCollection.findOne({ slug });
        assert.ok(siteDoc, `Destination ${slug} must exist in database`);
        assert.ok(siteDoc.image || siteDoc.images?.[0], `Destination ${slug} must have a valid photograph`);
      }
      recordPass('5.3 Taj Mahal, Red Fort, Qutub Minar, and Hampi preserve verified monument photographs');
    }

    // -------------------------------------------------------------
    // SUITE 6: Storage Cleanup & DELETE Endpoint
    // -------------------------------------------------------------
    console.log('\n--- SUITE 6: Delete Stored Image Endpoint & Security ---');

    // 6.1 Unauthorized delete attempt
    {
      const delRes = await fetch(`${BASE_URL}/api/admin/sites/upload-image?storageKey=${uploadedJpegMeta.storageKey}`, {
        method: 'DELETE',
      });
      assert.strictEqual(delRes.status, 401, 'Unauthorized DELETE must return 401');
      recordPass('6.1 Unauthenticated image delete request rejected with 401');
    }

    // 6.2 Visitor delete attempt
    {
      const delRes = await fetch(`${BASE_URL}/api/admin/sites/upload-image?storageKey=${uploadedJpegMeta.storageKey}`, {
        method: 'DELETE',
        headers: { Cookie: visitor.cookie },
      });
      assert.strictEqual(delRes.status, 403, 'Visitor DELETE must return 403');
      recordPass('6.2 Visitor image delete request rejected with 403');
    }

    // 6.3 Admin delete succeeds
    {
      const localFilePath = path.join(process.cwd(), 'public', uploadedJpegMeta.url.replace(/^\//, ''));
      assert.ok(fs.existsSync(localFilePath), 'File exists prior to delete');

      const delRes = await fetch(`${BASE_URL}/api/admin/sites/upload-image?storageKey=${uploadedJpegMeta.storageKey}`, {
        method: 'DELETE',
        headers: { Cookie: admin.cookie },
      });

      assert.strictEqual(delRes.status, 200, 'Admin DELETE must return 200');
      const delData = await delRes.json();
      assert.strictEqual(delData.success, true);
      assert.strictEqual(fs.existsSync(localFilePath), false, 'File must be physically removed from storage');
      recordPass('6.3 Admin successfully deleted stored image and removed it from filesystem');
    }

    // -------------------------------------------------------------
    // CLEANUP: Restore Ajanta Caves to pristine state
    // -------------------------------------------------------------
    console.log('\n--- CLEANUP: Restoring original Ajanta Caves monument data ---');
    await sitesCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(siteId) },
      {
        $set: {
          image: originalImage,
          primaryImageMetadata: {
            url: originalImage,
            source: 'STATIC_SEED',
            caption: 'Ajanta Caves Buddhist Monasteries & Cave Sanctuaries',
            alt: 'Panoramic facade of ancient rock-cut Buddhist caves at Ajanta',
          },
          gallery: originalGallery,
        },
      }
    );

    // Clean up remaining test uploaded files
    for (const key of createdStorageKeys) {
      try {
        const cleanRel = key.replace(/^uploads\//, '');
        const filePath = path.join(process.cwd(), 'public', 'uploads', cleanRel);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {}
    }

    // Clean up test users
    await usersCollection.deleteMany({
      email: { $in: [adminEmail, visitorEmail, staffEmail] },
    });

    recordPass('Cleanup completed successfully: restored pristine Ajanta Caves data and removed test files');

  } catch (err) {
    recordFail('Destination Images Audit encountered an unexpected exception', err);
  }

  console.log('\n================================================================');
  console.log(`DESTINATION IMAGES AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`Audit failed with ${failed} failure(s)`);
  }
}

// Allow direct execution
if (process.argv[1] && process.argv[1].endsWith('destination-images-audit.mjs')) {
  runDestinationImagesAudit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
