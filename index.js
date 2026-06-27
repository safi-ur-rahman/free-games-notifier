import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Helper function to handle pausing execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendFreeGamesEmail() {
  try {
    // 1. Read emails from subscribers.txt
    const filePath = path.join(process.cwd(), "subscribers.txt");

    if (!fs.existsSync(filePath)) {
      throw new Error(
        "subscribers.txt file not found! Please create it in the root directory.",
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const emailList = fileContent
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && !email.startsWith("#"));

    if (emailList.length === 0) {
      console.log(
        "No subscribers found in subscribers.txt. Skipping execution.",
      );
      return;
    }

    console.log(`Found ${emailList.length} subscriber(s). Fetching games...`);

    // 2. Fetch data from GamerPower API with Backoff Retry Logic
    const url = "https://www.gamerpower.com/api/filter?platform=epic-games-store.steam&type=game";
    const retryDelays = [10000, 20000, 30000]; // 10s, 20s, 30s in milliseconds
    let response;
    let games;

    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      try {
        response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        games = await response.json();
        break; // Success! Break out of the retry loop
      } catch (error) {
        if (attempt < retryDelays.length) {
          console.warn(
            `Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${retryDelays[attempt] / 1000}s...`
          );
          await delay(retryDelays[attempt]);
        } else {
          // No more retries left
          throw new Error(`All download attempts failed. Last error: ${error.message}`);
        }
      }
    }

    if (!games || games.length === 0) {
      console.log("No free games found today.");
      return;
    }

    // 3. Build the HTML template
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #1a1a1a; text-align: center;">🎮 Free Games Alert!</h2>
        <p style="text-align: center; color: #666;">Here are the latest free games available right now on Steam and Epic Games Store:</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    `;

    for (const game of games) {
      htmlContent += `
        <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f4f4f4;">
          <h3 style="color: #0078f2; margin-bottom: 5px;">${game.title}</h3>
          <p style="margin: 5px 0; font-weight: bold; color: #2ecc71;">Value: ${game.worth} (FREE)</p>
          <img src="${game.thumbnail}" alt="${game.title}" style="width: 100%; max-width: 250px; border-radius: 4px; margin: 10px 0;">
          <p style="color: #444; line-height: 1.5;">${game.description}</p>
          <p style="font-size: 0.9em; color: #7f8c8d;"><strong>Platforms:</strong> ${game.platforms}</p>
          <a href="${game.open_giveaway_url}" style="display: inline-block; background-color: #0078f2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Claim Game Here</a>
        </div>
      `;
    }

    htmlContent += `
        <p style="font-size: 0.8em; text-align: center; color: #999; margin-top: 20px;">Powered by GamerPower API & GitHub Actions</p>
      </div>
    `;

    // 4. Setup SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 5. Send the email to the parsed list (joined by commas)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailList.join(","),
      subject: "🔥 Free Games Update: Steam & Epic Games",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Workflow execution failed:", error);
    process.exit(1);
  }
}

sendFreeGamesEmail();