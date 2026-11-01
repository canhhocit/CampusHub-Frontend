import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_ROOT = path.resolve('d:/code/DA2/sourcecode/CampusHub-Frontend');

// ---------------------------------------------------------------------------
// UP-04: ProductDetail Purchase/Rental Hierarchy & Mobile Sticky Bar
// ---------------------------------------------------------------------------
test('UP-04: Segmented control and single primary CTA in ProductDetail', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  assert.ok(fs.existsSync(filePath), 'ProductDetail.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify Segmented Control is present when product.listingType === 'BOTH'
  assert.match(
    code,
    /product\.listingType === 'BOTH' && \([\s\S]*?setActionMode\('PURCHASE'\)[\s\S]*?setActionMode\('RENTAL'\)/,
    'Segmented control must toggle between PURCHASE and RENTAL when listingType === BOTH'
  );

  // Verify Single Primary CTA button below Segmented Control
  assert.match(
    code,
    /effectiveMode === 'PURCHASE' \? \([\s\S]*?Đặt mua qua Tủ Locker Thông Minh[\s\S]*?\) : \([\s\S]*?Chọn thời hạn & Thuê qua Locker/,
    'Must display a single primary CTA button corresponding to effectiveMode'
  );

  // Verify buttons meet WCAG touch target >= 44x44px
  assert.match(
    code,
    /min-h-\[44px\]/,
    'Primary CTA and segmented buttons must satisfy WCAG 2.2 touch target >= 44x44px'
  );

  // Verify duplicate video player section was removed
  assert.doesNotMatch(
    code,
    /Video giới thiệu sản phẩm[\s\S]*?Xem trên khung lớn/,
    'Redundant duplicate video player section under media gallery must be eliminated'
  );

  // Verify Rental Modal uses standard <Modal> component
  assert.match(
    code,
    /<Modal[\s\S]*?isOpen=\{isRentalModalOpen\}[\s\S]*?title="Chọn thời hạn thuê qua Smart Locker"/,
    'Rental Modal must reuse standard <Modal> component'
  );
});

test('UP-04: Mobile Sticky Action Bar and container clearance', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify sticky bottom action bar on mobile (lg:hidden)
  assert.match(
    code,
    /className="lg:hidden fixed bottom-0 inset-x-0 bg-white\/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30 flex items-center justify-between gap-3 shadow-lg"/,
    'Sticky bottom bar must be fixed at bottom-0, inset-x-0, and hidden on desktop (lg:hidden)'
  );

  // Verify mobile primary CTA has min-h-[44px]
  assert.match(
    code,
    /onClick=\{handlePrimaryAction\}[\s\S]*?min-h-\[44px\]/,
    'Sticky action button must meet WCAG 2.2 touch target >= 44x44px'
  );

  // Verify container padding has pb-24 clearance for mobile action bar
  assert.match(
    code,
    /min-h-screen bg-slate-50 pt-6 pb-24 sm:py-8 font-sans/,
    'Container must have pb-24 bottom clearance for sticky mobile bar'
  );
});

// ---------------------------------------------------------------------------
// UP-05: Pre-order Checkout Modal & Preferred Locker Selection
// ---------------------------------------------------------------------------
test('UP-05: Pre-order Checkout Modal with Escrow transparency and Locker Selection', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/ProductDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify Purchase Modal uses standard <Modal> component
  assert.match(
    code,
    /<Modal[\s\S]*?isOpen=\{isConfirmPurchaseOpen\}[\s\S]*?title="Xác nhận đặt mua qua Smart Locker"/,
    'Purchase checkout must use standard <Modal> instead of bare ConfirmDialog'
  );

  // Verify preferred locker selection state and active lockers query
  assert.match(
    code,
    /const \[preferredLockerId, setPreferredLockerId\] = useState<number \| null>\(null\);/,
    'Must maintain preferredLockerId state'
  );
  assert.match(
    code,
    /axiosInstance[\s\S]*?\.get\('\/api\/v1\/lockers', \{ params: \{ status: 'ACTIVE', size: 50 \} \}\)/,
    'Must fetch active lockers for checkout selector'
  );

  // Verify Escrow breakdown (item price, Escrow fee 0 ₫, total price, 100% guarantee)
  assert.match(code, /Giá sản phẩm niêm yết:/, 'Must show item listed price');
  assert.match(code, /Phí ký quỹ bảo vệ giao dịch:/, 'Must show escrow fee');
  assert.match(code, /0 ₫ \(Miễn phí sinh viên\)/, 'Escrow fee must show 0 ₫ free for students');
  assert.match(code, /Tổng thanh toán ký quỹ:/, 'Must show total escrow payment');
  assert.match(
    code,
    /Cam kết hoàn tiền 100% qua ký quỹ Escrow/,
    'Must show 100% money back guarantee message'
  );

  // Verify createOrderMutation passes preferredLockerId
  assert.match(
    code,
    /preferredLockerId: variables\?\.preferredLockerId \?\? null/,
    'createOrderMutation payload must include preferredLockerId'
  );
});

// ---------------------------------------------------------------------------
// UP-06: Action-First OrderDetail & Mobile PIN Pass
// ---------------------------------------------------------------------------
test('UP-06: Action-first column reordering on mobile in OrderDetail', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  assert.ok(fs.existsSync(filePath), 'OrderDetail.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify Left Column has order-2 on mobile, lg:order-1 on desktop
  assert.match(
    code,
    /className="order-2 lg:order-1 lg:col-span-7 space-y-6"/,
    'Left snapshot column must have order-2 on mobile and lg:order-1 on desktop'
  );

  // Verify Right Column has order-1 on mobile, lg:order-2 on desktop
  assert.match(
    code,
    /className="order-1 lg:order-2 lg:col-span-5 space-y-6"/,
    'Right action column must have order-1 on mobile and lg:order-2 on desktop'
  );
});

test('UP-06: Smart Locker Pickup Hero Pass and Keypad accessibility', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify Buyer Hero Pass PIN display (4xl, mono, tracking-widest, emerald-400)
  assert.match(
    code,
    /className="text-4xl font-mono tracking-widest font-extrabold text-emerald-400 select-all"/,
    'PIN must be large 4xl font-mono tracking-widest font-extrabold text-emerald-400'
  );

  // Verify station and compartment uppercase header
  assert.match(
    code,
    /order\.lockerName \? `\$\{order\.lockerName\.toUpperCase\(\)\} • NGĂN \$\{order\.compartmentCode \|\| 'CHỈ ĐỊNH'\}` : 'THẺ NHẬN ĐỒ SMART LOCKER'/,
    'Hero pass must display uppercase station name and compartment code'
  );

  // Verify copy button accessibility
  assert.match(
    code,
    /aria-label="Sao chép mã PIN"/,
    'PIN copy button must have aria-label="Sao chép mã PIN"'
  );

  // Verify instructions text
  assert.match(
    code,
    /Đến trước màn hình trạm tủ, chọn <strong>"Lấy đồ"<\/strong> và nhập mã PIN 6 số này\./,
    'Must display clear operational guidance for physical kiosk interaction'
  );

  // Verify Keypad accessibility aria-labels
  assert.match(
    code,
    /aria-label=\{`Phím số \$\{digit\}`\}/,
    'Keypad numeric keys must have dynamic aria-label'
  );
  assert.match(
    code,
    /aria-label="Xóa mã PIN đã nhập"/,
    'Keypad clear key must have aria-label'
  );
  assert.match(
    code,
    /aria-label="Xác nhận mở tủ bằng mã PIN"/,
    'Keypad OK key must have aria-label'
  );
});

test('UP-06: Responsive Stepper without 2-row breakpoint failure at 375px', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/orders/OrderDetail.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify mobile current step summary banner (sm:hidden)
  assert.match(
    code,
    /className="sm:hidden p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"/,
    'Must have a mobile current step summary banner visible on sm:hidden'
  );

  // Verify smooth horizontal track with connecting lines
  assert.match(
    code,
    /className="overflow-x-auto no-scrollbar py-2"/,
    'Timeline must have a scrollable horizontal container'
  );
  assert.match(
    code,
    /min-w-\[500px\] sm:min-w-0/,
    'Timeline must preserve minimum track width to avoid text wrapping'
  );
  assert.match(
    code,
    /status === 'completed' \? 'bg-slate-900' : 'bg-slate-200'/,
    'Timeline must have interconnecting connecting track lines'
  );
});

// ---------------------------------------------------------------------------
// UP-03: Marketplace Catalog & Bounded Filter
// ---------------------------------------------------------------------------
test('UP-03: ProductCard mobile post date always visible and no dead classes', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/components/ProductCard.tsx');
  assert.ok(fs.existsSync(filePath), 'ProductCard.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify no dead max-w-30 or xs:max-w-35
  assert.doesNotMatch(code, /max-w-30\b/, 'ProductCard must not use invalid max-w-30');
  assert.doesNotMatch(code, /xs:max-w-35\b/, 'ProductCard must not use invalid xs:max-w-35');
  assert.doesNotMatch(code, /hidden xs:flex\b/, 'ProductCard must not hide post date on mobile');

  // Verify category max width is properly bounded
  assert.match(
    code,
    /max-w-\[120px\]/,
    'Category badge must use max-w-[120px]'
  );

  // Verify post date is flex (always visible)
  assert.match(
    code,
    /className="flex items-center gap-1 text-slate-400 shrink-0 text-\[10px\] sm:text-\[11px\]"/,
    'Post date container must be flex on all viewports'
  );
});

test('UP-03: MarketplaceList bounded locker scroll, search, and token hygiene', () => {
  const filePath = path.join(FRONTEND_ROOT, 'src/pages/marketplace/MarketplaceList.tsx');
  assert.ok(fs.existsSync(filePath), 'MarketplaceList.tsx must exist');
  const code = fs.readFileSync(filePath, 'utf8');

  // Verify bounded locker list with max-h-52 and scrollbar-thin
  assert.match(
    code,
    /max-h-52 overflow-y-auto pr-1 space-y-1\.5 text-xs scrollbar-thin/,
    'Locker filter must have bounded max-h-52 container with scroll'
  );

  // Verify locker search input
  assert.match(
    code,
    /placeholder="Tìm trạm tủ\.\.\."/,
    'Locker filter must have a search input'
  );
  assert.match(
    code,
    /aria-label="Tìm kiếm trạm tủ locker"/,
    'Locker search input must have aria-label'
  );

  // Verify reuse of ProductCardSkeleton and EmptyState
  assert.match(
    code,
    /import \{ ProductCardSkeleton \} from '\.\.\/\.\.\/components\/common\/Skeleton';/,
    'Must import ProductCardSkeleton'
  );
  assert.match(
    code,
    /import \{ EmptyState \} from '\.\.\/\.\.\/components\/common\/EmptyState';/,
    'Must import EmptyState'
  );
  assert.match(code, /<ProductCardSkeleton key=\{idx\} \/>/, 'Must render ProductCardSkeleton');
  assert.match(code, /<EmptyState[\s\S]*?title="Không tìm thấy sản phẩm phù hợp"/, 'Must render EmptyState');

  // Verify no ad-hoc hex colors #f5f5f5 or #ededed
  assert.doesNotMatch(code, /#f5f5f5/, 'Must not use freeform hex #f5f5f5');
  assert.doesNotMatch(code, /#ededed/, 'Must not use freeform hex #ededed');
  assert.match(code, /bg-slate-50 py-4 sm:py-6 font-sans/, 'Main background must use bg-slate-50');
});

// ---------------------------------------------------------------------------
// Zero Emoji in all Sprint 2 Components (Anti-Slop Rule 9)
// ---------------------------------------------------------------------------
test('Zero emoji in all sprint 2 components', () => {
  // Regex covering standard emojis and pictographs
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const files = [
    'src/pages/marketplace/ProductDetail.tsx',
    'src/pages/orders/OrderDetail.tsx',
    'src/pages/marketplace/MarketplaceList.tsx',
    'src/components/ProductCard.tsx',
  ];

  for (const relPath of files) {
    const fullPath = path.join(FRONTEND_ROOT, relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.strictEqual(
      emojiRegex.test(content),
      false,
      `File ${relPath} must contain ZERO emojis (violates AGENTS.md rule 9)`
    );
  }
});
