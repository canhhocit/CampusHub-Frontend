import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');

test('UP-08: ProfilePage implements 3-Tab architecture', () => {
  const profileFile = path.join(SRC_DIR, 'pages/profile/ProfilePage.tsx');
  assert.ok(fs.existsSync(profileFile), 'ProfilePage.tsx must exist');
  const content = fs.readFileSync(profileFile, 'utf8');

  // Verify tab state & 3 tabs
  assert.ok(content.includes("role=\"tablist\""), 'ProfilePage must contain tablist role');
  assert.ok(content.includes("activeTab === 'PROFILE'"), 'ProfilePage must have PROFILE tab');
  assert.ok(content.includes("activeTab === 'SECURITY'"), 'ProfilePage must have SECURITY tab');
  assert.ok(content.includes("activeTab === 'NOTIFICATIONS'"), 'ProfilePage must have NOTIFICATIONS tab');
  assert.ok(content.includes("Hồ sơ cá nhân"), 'Must contain Hồ sơ cá nhân label');
  assert.ok(content.includes("Bảo mật & Mật khẩu"), 'Must contain Bảo mật & Mật khẩu label');
  assert.ok(content.includes("Thông báo Smart Locker"), 'Must contain Thông báo Smart Locker label');
});

test('UP-09: VerifyIdentity camera responsive ratio and recovery guide', () => {
  const verifyFile = path.join(SRC_DIR, 'pages/auth/VerifyIdentity.tsx');
  assert.ok(fs.existsSync(verifyFile), 'VerifyIdentity.tsx must exist');
  const content = fs.readFileSync(verifyFile, 'utf8');

  // Verify responsive camera constraints
  assert.ok(content.includes('max-h-[50vh]'), 'Camera viewport must enforce max-h-[50vh] on mobile');
  assert.ok(content.includes('<ellipse'), 'Must use vector SVG ellipse for face guide');
  assert.ok(content.includes('Cách gỡ chặn quyền Camera:'), 'Must provide camera permission recovery guide');
  assert.ok(content.includes('Chrome / Android:'), 'Must document Chrome/Android camera instructions');
  assert.ok(content.includes('Safari / iOS:'), 'Must document Safari/iOS camera instructions');
});

test('UP-02: Authentication deep link preservation and password strength', () => {
  const loginFile = path.join(SRC_DIR, 'pages/auth/Login.tsx');
  const registerFile = path.join(SRC_DIR, 'pages/auth/Register.tsx');
  const loginContent = fs.readFileSync(loginFile, 'utf8');
  const registerContent = fs.readFileSync(registerFile, 'utf8');

  // Login deep link & redirect
  assert.ok(loginContent.includes('from = (location.state as any)?.from?.pathname || \'/\''), 'Login must preserve deep link from state');
  assert.ok(loginContent.includes('navigate(from, { replace: true })'), 'Login must navigate to from');
  assert.ok(loginContent.includes('if (user)'), 'Login must redirect authenticated users');

  // Register password strength
  assert.ok(registerContent.includes('passwordStrength'), 'Register must compute password strength');
  assert.ok(registerContent.includes('Độ mạnh mật khẩu:'), 'Register must display password strength label');
  assert.ok(registerContent.includes('if (user)'), 'Register must redirect authenticated users');
});

test('UP-11: Admin UserManagement accessibility and touch targets', () => {
  const userMgmtFile = path.join(SRC_DIR, 'pages/admin/UserManagement.tsx');
  const content = fs.readFileSync(userMgmtFile, 'utf8');

  assert.ok(content.includes('min-h-[44px] min-w-[44px]'), 'Pagination buttons must meet >= 44x44px touch target');
  assert.ok(content.includes('text-slate-600'), 'Text contrast must use text-slate-600 or higher');
  assert.ok(content.includes('aria-label="Trang trước"'), 'Must have accessible pagination aria labels');
  assert.ok(content.includes('aria-label="Trang sau"'), 'Must have accessible pagination aria labels');
});

test('UP-13: Admin Disputes accessibility and 8-state feedback', () => {
  const disputesFile = path.join(SRC_DIR, 'pages/admin/AdminDisputes.tsx');
  const content = fs.readFileSync(disputesFile, 'utf8');

  assert.ok(content.includes('role="dialog"'), 'Dispute modal must declare role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Dispute modal must declare aria-modal="true"');
  assert.ok(content.includes('aria-label="Đóng cửa sổ phán quyết"'), 'Close button must have aria-label');
  assert.ok(content.includes('resolveMutation.isPending'), 'Must handle loading state');
  assert.ok(content.includes('Loader2'), 'Must display spinner icon during mutation');
});

test('Zero emoji across all Sprint 3 components', () => {
  const filesToCheck = [
    'pages/profile/ProfilePage.tsx',
    'pages/auth/VerifyIdentity.tsx',
    'pages/auth/Login.tsx',
    'pages/auth/Register.tsx',
    'pages/admin/UserManagement.tsx',
    'pages/admin/AdminDisputes.tsx',
  ];

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  for (const rel of filesToCheck) {
    const fullPath = path.join(SRC_DIR, rel);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(emojiRegex);
      assert.equal(match, null, `Emoji detected in ${rel}: ${match?.[0]}`);
    }
  }
});
