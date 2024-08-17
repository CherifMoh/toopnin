'use server'

import puppeteer from "puppeteer"
import { dbConnect } from "../lib/dbConnect"
import Design from "../models/design"


export async function sandMessage(recipient, message) {
    const username = process.env.Insta_Username
    const password = process.env.Insta_Password
  
    if (!username || !password || !recipient || !message) {
        return 'Missing required fields';
    }

    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        console.log('Navigating to Instagram login page...');
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

        console.log('Entering username and password...');
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);

        console.log('Clicking login button...');
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log('Checking if login was successful...');
        if (page.url().includes('/challenge/')) {
            await browser.close();
            return 'Two-factor authentication required or invalid credentials';
        }

        console.log('Navigating to recipient\'s profile...');
        await page.goto(`https://www.instagram.com/${recipient}/`, { waitUntil: 'networkidle2' });

        // Wait for the message div to be visible
        await page.waitForSelector('div[role="button"]', { visible: true, timeout: 30000 });

        // Find the message div and click on it
        const messageDivs = await page.$$('div[role="button"]');
        let messageClicked = false;

        for (const messageDiv of messageDivs) {
            const textContent = await page.evaluate(el => el.textContent.trim(), messageDiv);
            if (textContent.includes('Message')) {
                await messageDiv.click();
                messageClicked = true;
                console.log('Message div clicked.');
                break;
            }
        }

        if (!messageClicked) {
            await browser.close();
            return 'Message button not found please try again';
        }

        // Wait for the message input to be visible
        await page.waitForSelector('div[role="textbox"] p', { visible: true, timeout: 30000 });

        console.log('Message input found.');

        // Type the message into the input
        await page.type('div[role="textbox"] p', message);

        // Press Enter key to send the message
        await page.keyboard.press('Enter');

        console.log('Waiting for message to be sent...');
        // Add a delay or wait for confirmation that the message was sent (if possible)
        await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust this delay as needed

        console.log('Message sent.');
        return 'Message sent';

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}