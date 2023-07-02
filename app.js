const { Readable } = require("stream")
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")

const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

exports.handler = async (event, context, callback) => {
  if (!event.headers["url"] || !event.headers["email"]) {
    callback(null, {
      error: "Missing header params (url, email)!",
    })
  }

  const lighthouse = await import("lighthouse")

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
  })

  const runnerResult = await lighthouse.default(event.headers["url"], {
    logLevel: "info",
    output: "json",
    port: browser.port,
  })

  await browser.close()

  try {
    const client = new S3Client({ region: "eu-central-1" })
    const buffer = Buffer.from(runnerResult.report)
    const readable = Readable.from(buffer)

    const params = {
      Bucket: "ezaudit",
      Key: `audits/website.json`,
      Body: readable,
      ACL: "bucket-owner-full-control",
      ContentType: "text/plain",
      ContentLength: buffer.byteLength,
    }

    const command = new PutObjectCommand(params)

    await client.send(command)

    callback(null, "Report finished and stored!")
  } catch (e) {
    console.error(e)
  }
}
