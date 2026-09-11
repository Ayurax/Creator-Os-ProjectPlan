import { chromium } from 'playwright';

const apiBase = 'http://localhost:3000/api';

// Function to generate a random string
function randomString(length) {
  return Math.random().toString(36).substring(2, length + 2);
}

// Function to register and log in a user, returning the token
async function getAuthToken() {
  const email = `test_${randomString(8)}@example.com`;
  const password = 'TestPassword123!';
  const role = 'brand'; // We can choose any role, but let's use brand for Brand Dashboard

  // Try to register
  let res;
  try {
    res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
  } catch (e) {
    console.error('Registration failed:', e);
    // If registration fails, maybe the user already exists, try to log in
    res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error('Auth failed: ' + (data.message || 'Unknown error'));
  }
  return data.data.token;
}

// Function to take a screenshot of a page
async function takeScreenshot(page, path, waitForSelector = null) {
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector);
  } else {
    await page.waitForLoadState('networkidle');
  }
  await page.screenshot({ path, fullPage: true });
  console.log(`Screenshot saved to ${path}`);
}

(async () => {
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Get auth token
  let token;
  try {
    token = await getAuthToken();
    console.log('Authenticated');
  } catch (e) {
    console.error('Failed to authenticate:', e);
    await browser.close();
    return;
  }

  // Set token in localStorage
  await page.addInitScript((token) => {
    localStorage.setItem('token', token);
  }, token);

  // Array of pages to screenshot: { url, path, waitForSelector }
  const pages = [
    // Public pages
    { url: 'http://localhost:5173/login', path: 'login.png', waitForSelector: 'form' },
    { url: 'http://localhost:5173/register', path: 'register.png', waitForSelector: 'form' },

    // Protected pages - we need to be authenticated
    { url: 'http://localhost:5173/dashboard/brand', path: 'brand-dashboard.png', waitForSelector: '.metrics-strip' },
    { url: 'http://localhost:5173/dashboard/creator', path: 'creator-dashboard.png', waitForSelector: '.metrics-strip' },
    { url: 'http://localhost:5173/dashboard/freelancer', path: 'freelancer-dashboard.png', waitForSelector: '.metrics-strip' },
    { url: 'http://localhost:5173/dashboard/manager', path: 'talent-manager-dashboard.png', waitForSelector: '.metrics-strip' },
    { url: 'http://localhost:5173/campaigns', path: 'campaigns.png', waitForSelector: '.metrics-strip' },
    // We need a specific campaign ID for Campaign Detail. Let's get the first campaign from the list.
    // We'll skip Campaign Detail for now and come back to it.
    { url: 'http://localhost:5173/creators', path: 'creators.png', waitForSelector: '.collab-grid' },
    { url: 'http://localhost:5173/creators/1', path: 'creator-profile.png', waitForSelector: '.panel' }, // Assuming creator ID 1 exists
    { url: 'http://localhost:5173/collaborations', path: 'collaborations.png', waitForSelector: '.pipeline-bar' },
    { url: 'http://localhost:5173/contracts', path: 'contracts.png', waitForSelector: '.table-wrap' },
    { url: 'http://localhost:5173/tasks', path: 'tasks.png', waitForSelector: '.list-rows' },
    { url: 'http://localhost:5173/payments', path: 'payments.png', waitForSelector: '.table-wrap' },
    { url: 'http://localhost:5173/reviews', path: 'reviews.png', waitForSelector: '.table-wrap' },
    { url: 'http://localhost:5173/messages', path: 'messages.png', waitForSelector: '.messages-layout' },
    { url: 'http://localhost:5173/ai', path: 'ai.png', waitForSelector: '.panel' },
    { url: 'http://localhost:5173/portfolio', path: 'portfolio.png', waitForSelector: '.collab-grid' },
  ];

  // We need to handle Campaign Detail separately because we need a campaign ID.
  // Let's first get the list of campaigns and then take a screenshot of the first one.

  // We'll do that after we have visited the campaigns page and extracted the first campaign ID.

  // For now, let's take screenshots of the pages we can.

  for (const { url, path, waitForSelector } of pages) {
    try {
      console.log(`Visiting ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await takeScreenshot(page, path, waitForSelector);
    } catch (e) {
      console.error(`Failed to take screenshot of ${url}:`, e);
    }
  }

  // Now, let's get the first campaign ID from the campaigns page and take a screenshot of its detail.
  try {
    console.log('Getting campaign ID for Campaign Detail...');
    await page.goto('http://localhost:5173/campaigns', { waitUntil: 'networkidle' });
    // Wait for the campaign list to load
    await page.waitForSelector('.list-rows');
    // Get the first campaign link href
    const href = await page.$eval('.list-rows .list-row:first-child a', (el) => el.getAttribute('href'));
    if (href) {
      const campaignDetailUrl = `http://localhost:5173${href}`;
      console.log(`Campaign detail URL: ${campaignDetailUrl}`);
      await page.goto(campaignDetailUrl, { waitUntil: 'networkidle' });
      await takeScreenshot(page, 'campaign-detail.png', '.panel');
    } else {
      console.error('Could not get campaign detail URL');
    }
  } catch (e) {
    console.error('Failed to take Campaign Detail screenshot:', e);
  }

  // Close browser
  await browser.close();
  console.log('All screenshots taken');
})();