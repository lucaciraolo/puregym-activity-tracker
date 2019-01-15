import dotenv from "dotenv";
import pupeteer from "puppeteer";
import mongoose from "mongoose";

dotenv.config();

const activitySchema = new mongoose.Schema({
    timestamp: Date,
    people: Number
}, { collection: 'activity'});

const Activity = mongoose.model('Activity', activitySchema);

async function main() {
    const db = await setupDB();
    const page = await setupBrowser();
    // await migrateDatabase();
    
    const handle = setInterval(async () => {
        const people = await getNumberOfPeople(page).catch(err => console.error(err));
        // db.run(`INSERT INTO activity(timestamp, people) VALUES (?, ?)`, [Date.now(), people]);
        const activity = new Activity({
            timestamp: Date.now(),
            people
        });
        await activity.save().catch(err => console.error(err));
        console.log(activity);
    }, 60000);
}

async function setupDB() {
    await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}).catch((err) => console.error("error conencting to database", err));
    console.log('Connected to database!');
    return mongoose.connection;
}

async function setupBrowser() {
    const browser = await pupeteer.launch({
        headless: true
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

    await page.waitForNavigation();

    return page;
}

async function getNumberOfPeople(page) {
    await page.goto('https://www.puregym.com/members');
    const PEOPLE_SELECTOR = '#main-content > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div:nth-child(1) > div > p.para.para--small.margin-none > span';
    const peopleString = await page.evaluate(selector => document.querySelector(selector).innerText, PEOPLE_SELECTOR);
    const numberOfPeople = parseInt(peopleString.split(" ")[0]);
    return numberOfPeople;
}

// async function migrateDatabase() {
//     let db = await new sqlite3.Database('./db/PureGymActivityTracker.db');
//     console.log('old db connected');
//     const SQL = `SELECT timestamp, people FROM activity`;
//     let counter = 0;
//     db.each(SQL, [],  (err, row) => {
//         const activity = new Activity({
//             timestamp: Math.round(parseFloat(row.timestamp)),
//             people: row.people
//         });
//         activity.save().catch((err) => console.error(err));
//     });
//     // console.log(counter, 'rows found');
// }

main();