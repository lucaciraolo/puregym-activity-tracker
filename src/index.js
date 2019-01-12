import dotenv from "dotenv";
import pupeteer from "puppeteer";

dotenv.config();

async function run() {
    const browser = await pupeteer.launch();
    const page = await browser.newPage();

    // await page.goto('https://github')
}

run();