import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function watch(page) {
  const problems = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && problems.push(`http ${r.status()}: ${r.url()}`));
  return problems;
}
const noXScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
// The 3D layer starts on first interaction (or after a few seconds); nudge it.
const nudge = (page) => page.evaluate(() => window.dispatchEvent(new Event('scroll')));
const live = async (page) => { await nudge(page); await expect(page.locator('.scene')).toHaveClass(/scene--live/, { timeout: 20_000 }); };
test('loads with real content, no errors, no horizontal overflow', async ({ page }) => {
  const problems = watch(page);
  await page.goto('/?gl=force');
  await expect(page).toHaveTitle(/BarbersPro/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BarbersPro');
  await expect(page.getByRole('link', { name: 'Book a chair' }).first()).toBeVisible();
  await live(page);
  expect(await noXScroll(page)).toBe(true);
  expect(problems).toEqual([]);
});

test('no invented facts: no lorem, no dead # links, placeholders are marked', async ({ page }) => {
  await page.goto('/');
  const text = (await page.locator('body').innerText()).toLowerCase();
  expect(text).not.toContain('lorem');
  expect(text).not.toMatch(/\d{5} ?\d{6}/); // no made-up phone numbers
  const dead = await page.locator('a[href="#"]').count();
  expect(dead).toBe(0);
  expect(await page.locator('[data-placeholder]').count()).toBeGreaterThan(5);
  await expect(page.getByText('None published yet.')).toBeAttached();
});

test('scroll choreography: cut opens, razor scene stays live, CTAs stay reachable', async ({ page }) => {
  await page.goto('/?gl=force');
  await live(page);
  const gp = () => page.locator('.hero__stage').evaluate((el) => parseFloat(el.style.getPropertyValue('--gp') || '0'));
  expect(await gp()).toBe(0);
  const heroH = await page.locator('.hero').evaluate((el) => el.offsetHeight);
  const vh = page.viewportSize().height;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), (heroH - vh) * 0.7);
  // software-GL warm-up can starve the main thread for a few seconds in CI
  await expect.poll(gp, { timeout: 25_000 }).toBeGreaterThan(0.8);
  await expect(page.locator('.hero__cta .btn--red')).toBeInViewport();
  // escape the pin: later section arrives
  await page.evaluate((y) => window.scrollTo({ top: y + 50, behavior: 'instant' }), heroH);
  await expect(page.locator('.manifesto')).toBeInViewport();
});

test('scroll choreography also drives the poster fallback (no 3D needed)', async ({ page }) => {
  await page.goto('/');
  const gp = () => page.locator('.hero__stage').evaluate((el) => parseFloat(el.style.getPropertyValue('--gp') || '0'));
  const heroH = await page.locator('.hero').evaluate((el) => el.offsetHeight);
  const vh = page.viewportSize().height;
  for (const [frac, min, max] of [[0.03, 0, 0.01], [0.35, 0.3, 0.6], [0.8, 0.99, 1]]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), (heroH - vh) * frac);
    await expect.poll(gp).toBeGreaterThanOrEqual(min);
    expect(await gp()).toBeLessThanOrEqual(max);
  }
  // the cut reveals the town name
  await expect(page.locator('.slit')).toContainText('LUTON');
});

test('WebGL unavailable: designed poster fallback, page fully usable', async ({ page }) => {
  const problems = watch(page);
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (t, ...a) {
      return /webgl/.test(t) ? null : orig.call(this, t, ...a);
    };
  });
  await page.goto('/');
  await nudge(page);
  await page.waitForTimeout(1500);
  await expect(page.locator('.scene')).toHaveClass(/scene--poster/);
  await expect(page.locator('.poster')).toBeVisible();
  await expect(page.locator('.poster')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('img', { name: /straight razor/ })).toBeVisible();
  await expect(page.locator('.hero__cta .btn--red')).toBeInViewport();
  // the heavy 3D chunk must never have been requested
  expect(problems.filter((p) => p.includes('three'))).toEqual([]);
});

test('software-rendered WebGL (SwiftShader/llvmpipe) gets the poster, not a janky 3D hero', async ({ page }) => {
  await page.addInitScript(() => {
    for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      const gp = C.prototype.getParameter;
      C.prototype.getParameter = function (p) {
        return p === 0x9246 ? 'ANGLE (Google, Vulkan, SwiftShader Device)' : gp.call(this, p);
      };
    }
  });
  await page.goto('/');
  await nudge(page);
  await page.waitForTimeout(1500);
  await expect(page.locator('.scene')).toHaveClass(/scene--poster/);
  await expect(page.locator('.poster')).toHaveCSS('opacity', '1');
});

test('WebGL context loss falls back to the poster', async ({ page }) => {
  await page.goto('/?gl=force');
  await live(page);
  await page.evaluate(() => {
    const c = document.querySelector('.scene__canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    gl.getExtension('WEBGL_lose_context').loseContext();
  });
  await expect(page.locator('.scene')).toHaveClass(/scene--poster/);
  await expect(page.locator('.poster')).toHaveCSS('opacity', '1');
});

test('reduced motion: no pin, no scrubbing, static 3D frame, content intact', async ({ browser }, info) => {
  const ctx = await browser.newContext({ ...info.project.use, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const problems = watch(page);
  await page.goto('/?gl=force');
  await live(page);
  const vh = page.viewportSize().height;
  expect(await page.locator('.hero').evaluate((el) => el.offsetHeight)).toBeLessThanOrEqual(vh + 2);
  await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
  await page.waitForTimeout(300);
  expect(await page.locator('.hero__stage').evaluate((el) => el.style.getPropertyValue('--gp'))).toBe('');
  // menu rows are visible without a scroll trigger
  await expect(page.locator('.row').first()).toHaveCSS('clip-path', 'none');
  // work strip is a normal scroller, not pinned
  expect(await page.locator('.work').evaluate((el) => el.offsetHeight)).toBeLessThan(vh * 2);
  expect(await page.locator('.cue i, .hero__cue i').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(problems).toEqual([]);
  await ctx.close();
});

test('navigation and CTAs reach real targets', async ({ page }, info) => {
  await page.goto('/');
  await page.locator('.hero__cta .btn--red').click();
  await expect(page.locator('#book')).toBeInViewport({ ratio: 0.2 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('.hero__cta .btn--line').click(); // no phone supplied: goes to the menu
  await expect(page.locator('#services')).toBeInViewport({ ratio: 0.1 });
  expect(await page.locator('a[href^="tel:"]').count()).toBe(0);
  if (info.project.name === 'mobile') {
    await expect(page.locator('.dock')).toBeVisible();
    await page.locator('.dock a', { hasText: 'Work' }).click();
    await expect(page.locator('#work')).toBeInViewport({ ratio: 0.1 });
  }
});

test('booking form: validation, focus, honest not-connected result', async ({ page }) => {
  await page.goto('/#book');
  await page.getByRole('button', { name: 'Send request' }).click();
  await expect(page.getByText('Tell us your name.')).toBeVisible();
  await expect(page.getByText('Add a phone number or email')).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  await page.getByLabel('Name', { exact: true }).fill('Sam Tester');
  await page.getByLabel('Phone or email').fill('sam@example.test');
  await page.getByLabel('Service').selectOption('Skin fade');
  await page.getByLabel('Preferred day').selectOption('Sat');
  await page.getByRole('button', { name: 'Send request' }).click();
  const res = page.getByTestId('not-connected');
  await expect(res).toContainText('Not sent');
  await expect(res).toContainText('Name: Sam Tester');
  await expect(res).toContainText('Service: Skin fade');
});

test('keyboard: skip link first, visible focus, logical order', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip')).toBeFocused();
  await expect(page.locator('.skip')).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#services$/);
});

test('touch targets are at least 44px', async ({ page }, info) => {
  await page.goto('/');
  const sel = info.project.name === 'mobile' ? '.dock a, .hero__cta .btn' : '.nav__links a, .nav__book, .hero__cta .btn';
  const boxes = await page.locator(sel).evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [e.textContent.trim(), r.height]; }));
  for (const [name, h] of boxes) expect(h, name).toBeGreaterThanOrEqual(44);
});

test('accessibility: no serious axe violations (live 3D)', async ({ page }) => {
  await page.goto('/?gl=force');
  await live(page);
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
  const bad = violations.filter((v) => ['serious', 'critical', 'moderate'].includes(v.impact));
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`)).toEqual([]);
});

test('first load stays light: the 3D engine is not fetched until interaction', async ({ page }) => {
  const urls = [];
  page.on('request', (r) => urls.push(r.url()));
  await page.goto('/?gl=force');
  await page.waitForTimeout(1500);
  expect(urls.some((u) => /assets\/(three|razor)-/.test(u))).toBe(false);
  await expect(page.locator('.scene')).toHaveClass(/scene--poster/);
  await nudge(page);
  await expect(page.locator('.scene')).toHaveClass(/scene--live/, { timeout: 20_000 });
  expect(urls.some((u) => /assets\/three-/.test(u))).toBe(true);
});
