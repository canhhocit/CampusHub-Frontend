import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_ROOT = path.resolve('d:/code/DA2/sourcecode/CampusHub-Frontend');

test('UP-01: Navbar responsive breakpoints and tablet menu visibility', () => {
  const navbarPath = path.join(FRONTEND_ROOT, 'src/components/Navbar.tsx');
  assert.ok(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
  const code = fs.readFileSync(navbarPath, 'utf8');

  // Verify Hamburger cluster uses lg:hidden so it remains visible on tablet (768px-1023px)
  assert.match(
    code,
    /className="lg:hidden flex items-center/,
    'Hamburger button cluster must be visible on viewports under 1024px (tablet & mobile)'
  );

  // Verify desktop navigation is hidden on tablet (< 1024px)
  assert.match(
    code,
    /<nav className="hidden lg:flex items-center/,
    'Desktop nav links must be hidden under 1024px to prevent tablet overflow'
  );

  // Verify search bar is visible on tablet (>= 768px)
  assert.match(
    code,
    /<form[\s\S]*?className="hidden md:flex flex-1 min-w-40 max-w-md items-center"/,
    'Global search must be visible on tablet (>= 768px)'
  );

  // Verify Hamburger button has minimum touch target (44x44px)
  assert.match(
    code,
    /min-h-\[44px\] min-w-\[44px\]/,
    'Hamburger button must meet WCAG 2.2 touch target >= 44x44px'
  );

  // Verify Hamburger accessibility attributes
  assert.match(
    code,
    /aria-label=\{mobileMenuOpen \? "Đóng menu điều hướng" : "Mở menu điều hướng"\}/,
    'Hamburger must have dynamic aria-label'
  );
  assert.match(code, /aria-expanded=\{mobileMenuOpen\}/, 'Hamburger must have aria-expanded');
});

test('UP-01: Navbar mobile drawer modal, scroll-locking and ESC trap', () => {
  const navbarPath = path.join(FRONTEND_ROOT, 'src/components/Navbar.tsx');
  const code = fs.readFileSync(navbarPath, 'utf8');

  // Backdrop blur and overlay
  assert.match(
    code,
    /fixed inset-0 bg-slate-950\/40 backdrop-blur-xs/,
    'Drawer backdrop must have blur and dark overlay'
  );

  // Modal accessibility attributes
  assert.match(code, /role="dialog"/, 'Drawer panel must have role="dialog"');
  assert.match(code, /aria-modal="true"/, 'Drawer panel must have aria-modal="true"');

  // Scroll locking logic with restoration
  assert.match(
    code,
    /const originalOverflow = document\.body\.style\.overflow;[\s\S]*?document\.body\.style\.overflow = 'hidden';[\s\S]*?return \(\) => \{[\s\S]*?document\.body\.style\.overflow = originalOverflow;/,
    'Body scroll locking must set overflow=hidden and clean up to originalOverflow'
  );

  // ESC key listener with cleanup
  assert.match(
    code,
    /if \(e\.key === 'Escape'\) \{[\s\S]*?setMobileMenuOpen\(false\);[\s\S]*?setUserMenuOpen\(false\);/,
    'Escape key must close both mobile and user popover menus'
  );
  assert.match(
    code,
    /window\.removeEventListener\('keydown', handleKeyDown\)/,
    'Escape key listener must clean up on unmount'
  );

  // Route change cleanup
  assert.match(
    code,
    /useEffect\(\(\) => \{[\s\S]*?setMobileMenuOpen\(false\);[\s\S]*?setUserMenuOpen\(false\);[\s\S]*?\}, \[location\.pathname\]\);/,
    'Navigation must automatically dismiss mobile menu'
  );
});

test('UP-01: Desktop Account Popover Dropdown', () => {
  const navbarPath = path.join(FRONTEND_ROOT, 'src/components/Navbar.tsx');
  const code = fs.readFileSync(navbarPath, 'utf8');

  // Popover trigger has min-h-[44px]
  assert.match(
    code,
    /aria-label="Menu tài khoản cá nhân"[\s\S]*?min-h-\[44px\]/,
    'Account trigger button must have min 44px target and aria-label'
  );

  // Popover has role="menu" and role="menuitem"
  assert.match(code, /role="menu"/, 'Account dropdown must have role="menu"');
  assert.match(code, /role="menuitem"/, 'Dropdown links must have role="menuitem"');

  // Click outside handling
  assert.match(
    code,
    /document\.addEventListener\('mousedown', handleClickOutside\)/,
    'Click outside listener must be bound when popover open'
  );
});

test('UP-07: Locker Kiosk simulation transparency and touch keypad a11y', () => {
  const kioskPath = path.join(FRONTEND_ROOT, 'src/pages/kiosk/LockerKiosk.tsx');
  assert.ok(fs.existsSync(kioskPath), 'LockerKiosk.tsx must exist');
  const code = fs.readFileSync(kioskPath, 'utf8');

  // Ambient simulation banner
  assert.match(
    code,
    /MÔ PHỎNG PHẦN MỀM \(SIMULATED\)/,
    'Kiosk must feature prominent SIMULATED disclaimer banner'
  );

  // Touch keypad aria-labels
  assert.match(
    code,
    /const ariaLabel = isBack \? 'Xóa một chữ số' : isClear \? 'Xóa toàn bộ mã PIN' : `Chữ số \$\{key\}`;/,
    'Keypad buttons must generate descriptive aria-labels for all 12 keys'
  );
  assert.match(code, /aria-label=\{ariaLabel\}/, 'aria-label attribute must be applied to keypad button');

  // Touch target dimensions (h-16 = 64px >= 44px)
  assert.match(code, /h-16 rounded-xl font-bold text-xl/, 'Keypad buttons must have h-16 (64px) target size');

  // Simulation-labeled actions
  assert.match(code, /XÁC NHẬN MỞ TỦ \(MÔ PHỎNG\)/, 'Pickup action must be clearly labeled SIMULATED');
  assert.match(code, /MỞ NGĂN GỬI ĐỒ \(MÔ PHỎNG\)/, 'Deposit action must be clearly labeled SIMULATED');
  assert.match(code, /XÁC NHẬN HOÀN TẤT \(MÔ PHỎNG\)/, 'Completion action must be clearly labeled SIMULATED');
});

test('UP-07: SellingOrders slot availability and disabled state', () => {
  const sellingPath = path.join(FRONTEND_ROOT, 'src/pages/orders/SellingOrders.tsx');
  assert.ok(fs.existsSync(sellingPath), 'SellingOrders.tsx must exist');
  const code = fs.readFileSync(sellingPath, 'utf8');

  // Visual card selector checks availability
  assert.match(
    code,
    /const available = l\.availableCompartments \?\? 0;/,
    'Must read availableCompartments with fallback'
  );
  assert.match(code, /const isFull = available === 0;/, 'Must identify full lockers');
  assert.match(
    code,
    /if \(!isFull\) setSelectedLockerId\(l\.id\);/,
    'Must prevent selecting lockers with 0 available compartments'
  );
  assert.match(
    code,
    /Hết ngăn \(0\/\{total\}\)/,
    'Must display out-of-slots badge when locker is full'
  );
});

test('UP-12: Zero emoji in all sprint 1 components', () => {
  const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF\u2794-\u27BF]/;
  const files = [
    'src/components/Navbar.tsx',
    'src/components/UserLayout.tsx',
    'src/pages/kiosk/LockerKiosk.tsx',
    'src/pages/orders/SellingOrders.tsx',
    'src/pages/admin/lockers/LockerList.tsx',
    'src/components/admin/lockers/LockerMap.tsx',
    'src/components/admin/lockers/LockerLocationPicker.tsx',
  ];

  for (const relPath of files) {
    const fullPath = path.join(FRONTEND_ROOT, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      assert.doesNotMatch(
        line,
        emojiRegex,
        `Forbidden emoji found in ${relPath}:${index + 1}: ${line.trim()}`
      );
    });
  }
});

test('UP-12: Zero fake GPS synthesis across codebase', () => {
  const files = [
    'src/components/admin/lockers/LockerMap.tsx',
    'src/components/admin/lockers/LockerLocationPicker.tsx',
    'src/pages/admin/lockers/LockerList.tsx',
  ];

  for (const relPath of files) {
    const fullPath = path.join(FRONTEND_ROOT, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.doesNotMatch(
      content,
      /DEFAULT_CENTER\[0\] \+ \(locker\.id/,
      `Fake GPS calculation found in ${relPath}`
    );
    assert.doesNotMatch(
      content,
      /locker\.id\s*%\s*5/,
      `Fake GPS modulo pattern found in ${relPath}`
    );
  }
});

test('UP-10: Design tokens and orphan code cleanup', () => {
  // Orphan files must not exist
  assert.strictEqual(
    fs.existsSync(path.join(FRONTEND_ROOT, 'src/App.css')),
    false,
    'src/App.css must be deleted'
  );
  assert.strictEqual(
    fs.existsSync(path.join(FRONTEND_ROOT, 'src/components/AdminNav.tsx')),
    false,
    'src/components/AdminNav.tsx must be deleted'
  );

  // tailwind.config.js brand colors
  const tailwindPath = path.join(FRONTEND_ROOT, 'tailwind.config.js');
  const tailwindCode = fs.readFileSync(tailwindPath, 'utf8');
  assert.match(tailwindCode, /colors:\s*\{[\s\S]*?brand:\s*\{/, 'tailwind config must have brand colors');
  assert.match(tailwindCode, /boxShadow:\s*\{[\s\S]*?card:/, 'tailwind config must have boxShadow.card');

  // index.css @theme tokens and focus-visible
  const indexCssPath = path.join(FRONTEND_ROOT, 'src/index.css');
  const indexCss = fs.readFileSync(indexCssPath, 'utf8');
  assert.match(indexCss, /--color-brand-600: #059669;/, 'index.css must define brand-600 token');
  assert.match(indexCss, /:focus-visible\s*\{[\s\S]*?outline:\s*2px solid #059669;/, 'focus indicator must use brand color #059669');
});
