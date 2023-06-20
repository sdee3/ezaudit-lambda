const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

exports.handler = async (event, context, callback) => {
  // Optional: If you'd like to use the legacy headless mode. "new" is the default.
  chromium.setHeadlessMode = true;

  const lighthouse = await import("lighthouse");

  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      "--disable-web-security",
      "--headless",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    debuggingPort: 9222,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: "new",
    ignoreHTTPSErrors: true,
  });

  const runnerResult = await lighthouse.default(
    "https://news.ycombinator.com/",
    {
      logLevel: "info",
      output: "json",
      onlyCategories: ["performance"],
      port: browser.port,
    }
  );

  await browser.close();

  callback(null, runnerResult.report);
};
