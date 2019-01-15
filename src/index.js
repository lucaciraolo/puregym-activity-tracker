import dotenv from 'dotenv';
import pupeteer from 'puppeteer';
import mongoose from 'mongoose';

dotenv.config();

const activitySchema = new mongoose.Schema({
  timestamp: Date,
  people: Number,
}, { collection: 'activity' });

const Activity = mongoose.model('Activity', activitySchema);

async function setupDB() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).catch(err => console.error('error conencting to database', err));
  console.log('Connected to database!');
  return mongoose.connection;
}

async function setupBrowser() {
  const browser = await pupeteer.launch({
    headless: true,
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

  const PEOPLE_SELECTOR = '#main-content > div:nth-child(2) > div > div > div:nth-child(2)'
  + ' > div > div > div > div:nth-child(1) > div > p.para.para--small.margin-none > span';

  const peopleString = await page.evaluate(
    selector => document.querySelector(selector).innerText, PEOPLE_SELECTOR);
  const numberOfPeople = parseInt(peopleString.split(' ')[0], 10);
  return numberOfPeople;
}

async function main() {
  await setupDB();
  const page = await setupBrowser();
  console.log('set up browser');

  setInterval(async () => {
    const people = await getNumberOfPeople(page).catch(err => console.error(err));

    const activity = new Activity({
      timestamp: Date.now(),
      people,
    });
    await activity.save().catch(err => console.error(err));
    console.log(activity);
  }, 60000);
}

main();
