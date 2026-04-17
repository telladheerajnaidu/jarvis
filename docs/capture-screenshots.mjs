import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = './docs/screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // ===============================================
  // 1. Login page (clean state)
  // ===============================================
  console.log('01 - Login page...');
  const loginPage = await ctx.newPage();
  await loginPage.goto(BASE, { waitUntil: 'networkidle' });
  await loginPage.waitForTimeout(4000); // wait for boot animation
  await loginPage.screenshot({ path: `${OUT}/01_login_page.png`, fullPage: false });

  // ===============================================
  // 2. Bug 1 - Case-sensitive email error
  // ===============================================
  console.log('02 - Bug 1: case error...');
  await loginPage.fill('input[type="text"]', 'Abhijeet@q2software.com');
  await loginPage.fill('input[type="password"]', 'ironclad');
  await loginPage.click('button[type="submit"]');
  await loginPage.waitForTimeout(1500);
  await loginPage.screenshot({ path: `${OUT}/02_bug1_case_error_ui.png`, fullPage: false });

  // Capture the API response for Bug 1
  const bug1Resp = await loginPage.evaluate(async () => {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'Abhijeet@q2software.com', password: 'ironclad' }),
    });
    return r.json();
  });
  writeFileSync(`${OUT}/02_bug1_response_body.json`, JSON.stringify(bug1Resp, null, 2));
  console.log('  Bug 1 response:', JSON.stringify(bug1Resp));

  // ===============================================
  // 3. Successful login -> Bug 2 (cookie path)
  //    We bypass via /api/admin/grant to get past L3 for screenshots
  // ===============================================
  console.log('03 - Grant session & gallery...');
  const suitsPage = await ctx.newPage();
  await suitsPage.goto(`${BASE}/api/admin/grant`, { waitUntil: 'networkidle' });
  await suitsPage.goto(`${BASE}/suits`, { waitUntil: 'networkidle' });
  await suitsPage.waitForTimeout(3000);
  await suitsPage.screenshot({ path: `${OUT}/03_gallery_after_login.png`, fullPage: false });

  // ===============================================
  // 3b. Bug 2 - Cookie path demo
  //     Log in with correct creds (lowercase), show /suits UNAUTHORIZED
  // ===============================================
  console.log('03b - Bug 2: cookie path...');
  const bug2Page = await ctx.newPage();
  // Clear existing cookies first
  await ctx.clearCookies();
  // Login with correct creds via navigation to trigger the cookie
  await bug2Page.goto(BASE, { waitUntil: 'networkidle' });
  await bug2Page.waitForTimeout(3500);
  await bug2Page.fill('input[type="text"]', 'abhijeet@q2software.com');
  await bug2Page.fill('input[type="password"]', 'ironclad');
  await bug2Page.click('button[type="submit"]');
  await bug2Page.waitForTimeout(2000);
  // Should land on /suits but show UNAUTHORIZED because cookie is Path=/admin
  await bug2Page.screenshot({ path: `${OUT}/03b_bug2_cookie_path_unauthorized.png`, fullPage: false });

  // ===============================================
  // 4. Bug 3 - snake_case mismatch on detail page
  // ===============================================
  console.log('04 - Bug 3: snake_case detail...');
  // Use the granted session page
  const detailPage = await ctx.newPage();
  // Re-grant session
  await detailPage.goto(`${BASE}/api/admin/grant`, { waitUntil: 'networkidle' });
  await detailPage.goto(`${BASE}/suits/mk50`, { waitUntil: 'networkidle' });
  await detailPage.waitForTimeout(3000);
  await detailPage.screenshot({ path: `${OUT}/04_bug3_snake_case_detail.png`, fullPage: false });

  // Capture the API response to show snake_case fields
  const suitResp = await detailPage.evaluate(async () => {
    const r = await fetch('/api/suits/mk50');
    return r.json();
  });
  writeFileSync(`${OUT}/04_bug3_api_response.json`, JSON.stringify({
    power_output: suitResp.suit?.power_output,
    top_speed: suitResp.suit?.top_speed,
    note: "API returns snake_case but UI reads camelCase (powerOutput/topSpeed)"
  }, null, 2));

  // ===============================================
  // 5. Bug 4 - RESYNC stale (same as old Bug 2)
  // ===============================================
  console.log('05 - Bug 4: RESYNC stale...');
  const resyncPage = await ctx.newPage();
  await resyncPage.goto(`${BASE}/api/admin/grant`, { waitUntil: 'networkidle' });
  await resyncPage.goto(`${BASE}/suits`, { waitUntil: 'networkidle' });
  await resyncPage.waitForTimeout(3000);
  await resyncPage.screenshot({ path: `${OUT}/05_bug4_resync_stale.png`, fullPage: false });

  // Capture localStorage cache data
  const cacheData = await resyncPage.evaluate(() => {
    const raw = localStorage.getItem('jarvis_suits_cache_v1');
    return raw ? JSON.parse(raw) : null;
  });
  if (cacheData) {
    writeFileSync(`${OUT}/05_bug4_cache_data.json`, JSON.stringify({
      at: cacheData.at,
      mark: cacheData.mark,
      heartbeat: cacheData.data?.heartbeat,
      server_timestamp: cacheData.data?.server_timestamp,
    }, null, 2));
  }

  // ===============================================
  // 6. Bug 5 - Race condition mid-flight
  // ===============================================
  console.log('06 - Bug 5: race condition...');
  const racePage = await ctx.newPage();
  await racePage.goto(`${BASE}/api/admin/grant`, { waitUntil: 'networkidle' });
  // Clear localStorage to avoid cache interference
  await racePage.goto(`${BASE}/api/admin/flush-cache`, { waitUntil: 'networkidle' });
  await racePage.goto(`${BASE}/suits`, { waitUntil: 'networkidle' });
  await racePage.waitForTimeout(3000);

  // Apply mark 3 (slow)
  await racePage.fill('input[type="number"]', '3');
  await racePage.click('button[type="submit"]');
  await racePage.waitForTimeout(1500); // mid-flight
  await racePage.screenshot({ path: `${OUT}/06_bug5_race_midflight.png`, fullPage: false });

  // Now apply mark 85 (fast) while mark 3 is still pending
  await racePage.fill('input[type="number"]', '85');
  await racePage.click('button[type="submit"]');
  await racePage.waitForTimeout(500); // mark 85 returns quickly
  await racePage.screenshot({ path: `${OUT}/06_bug5_race_mark85_brief.png`, fullPage: false });

  // Wait for mark 3 to clobber
  await racePage.waitForTimeout(5000);
  await racePage.screenshot({ path: `${OUT}/06_bug5_race_final_clobber.png`, fullPage: false });

  // ===============================================
  // 7. Detail page (clean, for general reference)
  // ===============================================
  console.log('07 - Detail page mk50...');
  const detailClean = await ctx.newPage();
  await detailClean.goto(`${BASE}/api/admin/grant`, { waitUntil: 'networkidle' });
  await detailClean.goto(`${BASE}/suits/mk50`, { waitUntil: 'networkidle' });
  await detailClean.waitForTimeout(3000);
  await detailClean.screenshot({ path: `${OUT}/07_detail_mk50.png`, fullPage: false });

  // ===============================================
  // 8. Admin reset page
  // ===============================================
  console.log('08 - Admin reset...');
  const resetPage = await ctx.newPage();
  await resetPage.goto(`${BASE}/admin/reset`, { waitUntil: 'networkidle' });
  await resetPage.waitForTimeout(3000);
  await resetPage.screenshot({ path: `${OUT}/08_admin_reset.png`, fullPage: false });

  await browser.close();
  console.log('All screenshots captured!');
}

main().catch((e) => { console.error(e); process.exit(1); });
