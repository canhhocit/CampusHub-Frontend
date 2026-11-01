import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_ROOT = path.resolve('d:/code/DA2/sourcecode/CampusHub-Frontend');

// ============================================================================
// STRESS SUITE 1: Mobile OrderDetail Layout & Action Card Reordering
// ============================================================================
test('STRESS 1.1: OrderDetail enforces Action Card order-1 on mobile (<1024px)', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  assert.ok(fs.existsSync(filePath), 'OrderDetail.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify grid definition
  assert.match(
    code,
    /className="grid grid-cols-1 lg:grid-cols-12 gap-6"/,
    'Grid must be 1 column on mobile (< 1024px) and 12 columns on desktop (lg:grid-cols-12)'
  );

  // Left column (Product details, map, counterparties) MUST be order-2 on mobile, lg:order-1 on desktop
  assert.match(
    code,
    /<div className="order-2 lg:order-1 lg:col-span-7 space-y-6">/,
    'Left snapshot column must be ordered AFTER the action column on mobile via order-2'
  );

  // Right column (Payment, PIN Hero Pass, Keypad Terminal) MUST be order-1 on mobile, lg:order-2 on desktop
  assert.match(
    code,
    /<div className="order-1 lg:order-2 lg:col-span-5 space-y-6">/,
    'Right action column must be ordered FIRST on mobile via order-1'
  );
});

test('STRESS 1.2: READY_FOR_PICKUP Buyer PIN Hero Pass layout & attributes', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Locate the Buyer Pickup Terminal Flow section
  const flowStartIndex = code.indexOf('{/* Buyer Pickup Terminal Flow */}');
  const flowEndIndex = code.indexOf('{/* Rental Active: Renting Period State */}');
  assert.ok(flowStartIndex !== -1, 'Must contain Buyer Pickup Terminal Flow section');
  assert.ok(flowEndIndex > flowStartIndex, 'Must contain end of Buyer Pickup Terminal Flow section');
  const flowCode = code.substring(flowStartIndex, flowEndIndex);

  // Verify order.status guard
  assert.match(flowCode, /order\.status === 'READY_FOR_PICKUP'/);
  assert.match(flowCode, /isBuyer && order\.pickupCode/);

  // 1. PIN styling: text-4xl, font-mono, tracking-widest, font-extrabold, text-emerald-400
  assert.match(flowCode, /text-4xl font-mono tracking-widest font-extrabold text-emerald-400 select-all/);

  // 2. Station & Compartment header formatting
  assert.match(flowCode, /order\.lockerName \? `\$\{order\.lockerName\.toUpperCase\(\)\} • NGĂN \$\{order\.compartmentCode \|\| 'CHỈ ĐỊNH'\}`/);

  // 3. Fallback header when lockerName is undefined
  assert.match(flowCode, /: 'THẺ NHẬN ĐỒ SMART LOCKER'/);

  // 4. Accessible Copy Button
  assert.match(flowCode, /aria-label="Sao chép mã PIN"/);
  assert.match(flowCode, /min-h-\[38px\] active:scale-95/);

  // 5. Physical kiosk instruction guidance
  assert.match(flowCode, /Đến trước màn hình trạm tủ, chọn <strong>"Lấy đồ"<\/strong> và nhập mã PIN 6 số này\./);
});

test('STRESS 1.3: READY_FOR_RETURN_PICKUP Seller PIN Hero Pass layout & attributes', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Locate the Seller Return Pickup Terminal Flow section
  const returnStartIndex = code.indexOf('{/* Seller Return Pickup Terminal Flow */}');
  const returnEndIndex = code.indexOf('{/* Seller Deposit Item Action */}');
  assert.ok(returnStartIndex !== -1, 'Must contain Seller Return Pickup Terminal Flow section');
  assert.ok(returnEndIndex > returnStartIndex, 'Must contain end of Seller Return Pickup Terminal Flow section');
  const returnCode = code.substring(returnStartIndex, returnEndIndex);

  // Verify order.status guard
  assert.match(returnCode, /order\.status === 'READY_FOR_RETURN_PICKUP'/);
  assert.match(returnCode, /isSeller && \(order\.pickupCode \|\| order\.returnPickupCode\)/);

  // 1. PIN display
  assert.match(returnCode, /text-4xl font-mono tracking-widest font-extrabold text-emerald-400 select-all/);

  // 2. Return Locker & Compartment header
  assert.match(returnCode, /order\.returnLockerName \? `\$\{order\.returnLockerName\.toUpperCase\(\)\} • NGĂN \$\{order\.returnCompartmentCode \|\| 'CHỈ ĐỊNH'\}`/);

  // 3. Fallback header
  assert.match(returnCode, /: 'THẺ NHẬN LẠI ĐỒ'/);

  // 4. Accessible copy button
  assert.match(returnCode, /aria-label="Sao chép mã PIN"/);
});

test('STRESS 1.4: Stepper 375px layout prevents multi-row wrapping and broken connectors', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify elimination of grid-cols-2 or any grid in Stepper
  const stepperStartIndex = code.indexOf('{/* Stepper / Timeline */}');
  const stepperEndIndex = code.indexOf('{/* 2-Column Layout');
  assert.ok(stepperStartIndex !== -1, 'Must contain Stepper/Timeline section');
  assert.ok(stepperEndIndex > stepperStartIndex, 'Must contain end of Stepper section');
  const stepperCode = code.substring(stepperStartIndex, stepperEndIndex);

  assert.doesNotMatch(
    stepperCode,
    /grid-cols-2/,
    'Stepper must NOT use grid-cols-2 which breaks timelines into 2-3 disjointed rows on mobile'
  );

  // Verify horizontal track wrapper
  assert.match(
    stepperCode,
    /className="overflow-x-auto no-scrollbar py-2"/,
    'Stepper must use horizontal scroll container on narrow viewports'
  );

  // Verify minimum width preservation on mobile
  assert.match(
    stepperCode,
    /min-w-\[500px\] sm:min-w-0/,
    'Stepper track must maintain min-w-[500px] on mobile to prevent squishing below 375px'
  );

  // Verify continuous connecting lines between steps
  assert.match(
    stepperCode,
    /className=\{`absolute top-4 left-1\/2 w-full h-0\.5 -z-0 transition-colors \$\{\s*status === 'completed' \? 'bg-slate-900' : 'bg-slate-200'\s*\}`\}/,
    'Connecting lines must bridge adjacent nodes horizontally'
  );

  // Verify mobile current step summary card for immediate 375px glanceability
  assert.match(
    stepperCode,
    /className="sm:hidden p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"/,
    'Must provide mobile step summary card for instant 375px readability without scrolling'
  );
  assert.match(stepperCode, /Bước \{activeIdx \+ 1\}\/\{steps\.length\}/);
});

test('STRESS 1.5: Keypad touch terminal accessibility and input boundary enforcement', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // 1. All keypad digits 0-9 have aria-labels
  assert.match(code, /aria-label=\{`Phím số \$\{digit\}`\}/);
  assert.match(code, /aria-label="Phím số 0"/);
  assert.match(code, /aria-label="Xóa mã PIN đã nhập"/);
  assert.match(code, /aria-label="Xác nhận mở tủ bằng mã PIN"/);
  assert.match(code, /aria-label="Xác nhận mở tủ lấy hàng"/);

  // 2. Strict 6-digit PIN length requirement
  assert.match(code, /disabled=\{pickupCodeInput\.length !== 6 \|\| pickupMutation\.isPending\}/);

  // 3. Clear simulated label present
  assert.match(code, /MÔ PHỎNG/);
});

// ============================================================================
// STRESS SUITE 2: ProductDetail Segmented Control & Sticky Action Bar
// ============================================================================
test('STRESS 2.1: Segmented Control state toggle & single primary CTA logic', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  assert.ok(fs.existsSync(filePath), 'ProductDetail.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // 1. Verify actionMode state and effectiveMode derivation
  assert.match(
    code,
    /const \[actionMode, setActionMode\] = useState<'PURCHASE' \| 'RENTAL'>\('PURCHASE'\);/,
    'Must declare actionMode state with default PURCHASE'
  );

  assert.match(
    code,
    /const effectiveMode: 'PURCHASE' \| 'RENTAL' =\s*product\?\.listingType === 'RENT'\s*\?\s*'RENTAL'\s*:\s*product\?\.listingType === 'BOTH'\s*\?\s*actionMode\s*:\s*'PURCHASE';/,
    'effectiveMode must strictly resolve based on listingType and actionMode'
  );

  // 2. Segmented control only renders when product.listingType === 'BOTH'
  assert.match(
    code,
    /product\.listingType === 'BOTH' && \([\s\S]*?grid grid-cols-2[\s\S]*?setActionMode\('PURCHASE'\)[\s\S]*?setActionMode\('RENTAL'\)/
  );

  // 3. Exactly ONE primary CTA button rendered based on effectiveMode
  assert.match(
    code,
    /\{effectiveMode === 'PURCHASE' \? \([\s\S]*?Đặt mua qua Tủ Locker Thông Minh[\s\S]*?\) : \([\s\S]*?Chọn thời hạn & Thuê qua Locker[\s\S]*?\)\}/
  );

  // 4. Primary CTA touch targets meet WCAG >= 44x44px
  assert.match(code, /className="w-full py-3\.5 px-6 bg-emerald-600[\s\S]*?min-h-\[44px\]/);
  assert.match(code, /className="w-full py-3\.5 px-6 bg-slate-900[\s\S]*?min-h-\[44px\]/);
});

test('STRESS 2.2: Sticky Mobile Action Bar visibility, layout, and page clearance', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // 1. Sticky bar only renders on mobile (lg:hidden) and active listing for non-owner
  assert.match(
    code,
    /\{product\?\.status === 'ACTIVE' && !isOwner && \(\s*<div className="lg:hidden fixed bottom-0 inset-x-0 bg-white\/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30 flex items-center justify-between gap-3 shadow-lg">/
  );

  // 2. Quick toggle button in sticky bar when listingType === 'BOTH'
  assert.match(
    code,
    /product\.listingType === 'BOTH' && \(\s*<button[\s\S]*?onClick=\{\(\) => setActionMode\(\(prev\) => \(prev === 'PURCHASE' \? 'RENTAL' : 'PURCHASE'\)\)\}[\s\S]*?\{actionMode === 'PURCHASE' \? 'Đổi: Thuê' : 'Đổi: Mua'\}/
  );

  // 3. Primary action button in sticky bar invokes handlePrimaryAction
  assert.match(
    code,
    /<button[\s\S]*?onClick=\{handlePrimaryAction\}[\s\S]*?min-h-\[44px\]/
  );

  // 4. Container bottom padding pb-24 (96px) ensures complete clearance over sticky bar (~60px)
  assert.match(
    code,
    /className="min-h-screen bg-slate-50 pt-6 pb-24 sm:py-8 font-sans"/,
    'Container must have pb-24 clearance preventing sticky action bar from obscuring content'
  );
});

test('STRESS 2.3: Verification of Pre-order Escrow transparency and Preferred Locker payload', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // 1. createOrderMutation passes preferredLockerId
  assert.match(
    code,
    /createOrderMutation = useMutation\(\{[\s\S]*?preferredLockerId: variables\?\.preferredLockerId \?\? null/
  );

  // 2. Active lockers dropdown query for preferred locker station
  assert.match(
    code,
    /queryKey: \['active-lockers-dropdown'\]/
  );

  // 3. Purchase modal breakdown with 100% money-back escrow guarantee
  assert.match(code, /Cam kết hoàn tiền 100% qua ký quỹ Escrow/);
  assert.match(code, /0 ₫ \(Miễn phí sinh viên\)/);
});

// ============================================================================
// STRESS SUITE 3: Comprehensive Anti-Slop & Design Consistency
// ============================================================================
test('STRESS 3.1: Zero emoji presence across all Sprint 2 modified components', () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const targetFiles = [
    'src/pages/orders/OrderDetail.tsx',
    'src/pages/marketplace/ProductDetail.tsx',
    'src/pages/marketplace/MarketplaceList.tsx',
    'src/components/ProductCard.tsx',
  ];

  for (const file of targetFiles) {
    const fullPath = path.join(FRONTEND_ROOT, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasEmoji = emojiRegex.test(content);
    assert.strictEqual(
      hasEmoji,
      false,
      `Emoji detected in ${file} - violates Rule 9 of AGENTS.md`
    );
  }
});
