import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 },
    timeout: 60000
  });
  const page = await browser.newPage();
  
  // Navigate to the banner export page
  // Note: We assume the dev server is running on port 3000. 
  // If not, we might need to start it or use a static file approach.
  // For this environment, we'll try to access the dev server URL.
  await page.goto('http://localhost:3000/banner-export', { waitUntil: 'networkidle0' });

  // Wait for any animations or fonts
  await new Promise(r => setTimeout(r, 2000));

  // Select the banner element
  const element = await page.$('.w-\\[1200px\\]');
  
  if (element) {
    await element.screenshot({
      path: '/home/ubuntu/hdmobil/client/public/images/banner_dynamic_final.png',
      omitBackground: true,
      type: 'png'
    });
    console.log('Banner captured successfully!');
  } else {
    console.error('Banner element not found!');
  }

  await browser.close();
})();
