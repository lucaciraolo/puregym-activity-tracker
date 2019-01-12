import pupeteer from "puppeteer";

async function run() {
    const browser = await pupeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://github')
}

run();