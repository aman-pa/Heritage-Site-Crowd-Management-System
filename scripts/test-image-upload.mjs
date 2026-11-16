import { readFileSync } from 'fs';
import { join } from 'path';

const UPLOAD_URL = 'http://localhost:3000/api/admin/sites/upload-image';

// You need to get the auth token first by logging in
// This is a placeholder - you'll need to replace with actual admin JWT
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Replace with actual token

async function testImageUpload() {
  console.log('🧪 Testing Image Upload API...\n');

  // Create a simple test image buffer (1x1 PNG pixel)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
    0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82 // IEND chunk
  ]);

  // Create form data
  const formData = new FormData();
  const blob = new Blob([testImageBuffer], { type: 'image/png' });
  const file = new File([blob], 'test-image.png', { type: 'image/png' });
  formData.append('file', file);
  formData.append('prefix', 'destinations');

  try {
    console.log('📤 Uploading test image without auth...');
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Body:', JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log('\n✅ Auth middleware working correctly (401 without token)');
      console.log('💡 To test with auth, login as admin and get the JWT cookie');
    } else if (response.ok) {
      console.log('\n✅ Upload successful!');
      console.log('📸 Image URL:', data.data?.url);
    } else {
      console.log('\n❌ Upload failed:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
  }
}

testImageUpload();
