import dotenv from "dotenv";
import pupeteer from "puppeteer";
import sqlite3 from "sqlite3";

dotenv.config();

sqlite3.verbose();

async function main() {
    const db = await setupDB();
    const page = await setupBrowser();

    db.run('CREATE TABLE IF NOT EXISTS activity(timestamp TEXT, people INT)');

    const handle = setInterval(async () => {
        const people = await getNumberOfPeople(page);
        db.run(`INSERT INTO activity(timestamp, people) VALUES (?, ?)`, [Date.now(), people]);
        console.log(Date.now(), people);
    }, 60000);
}

async function setupDB() {
    return new sqlite3.Database('./db/PureGymActivityTracker.db', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the database.')
        }
    });
}

async function setupBrowser() {
    const browser = await pupeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    // automatic redirect to login page
    await page.goto('https://www.puregym.com/members');

    const EMAIL_SELECTOR = '#email';
    const PIN_SELECTOR = '#pin';
    const BUTTON_SELECTOR = '#login-submit';

    await page.click(EMAIL_SELECTOR);
    await page.keyboard.type(process.env.EMAIL);

    await page.click(PIN_SELECTOR);
    await page.keyboard.type(process.env.PIN);

    await page.click(BUTTON_SELECTOR);

    await page.waitForNavigation({
        timeout: 5
    }).catch(() => {
        console.error("email or pin incorrect.");
        process.exit(1);
    });

    return page;
}

async function getNumberOfPeople(page) {
    await page.goto('https://www.puregym.com/members');
    const PEOPLE_SELECTOR = '#main-content > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div:nth-child(1) > div > p.para.para--small.margin-none > span';
    const peopleString = await page.evaluate(selector => document.querySelector(selector).innerText, PEOPLE_SELECTOR);
    const numberOfPeople = parseInt(peopleString.split(" ")[0]);
    return numberOfPeople;
}

// async function getNumberOfPeople() 

main();