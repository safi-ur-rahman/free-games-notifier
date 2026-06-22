import nodemailer from 'nodemailer';

async function sendFreeGamesEmail() {
  try {
    // 1. Fetch data from GamerPower API
    const response = await fetch('https://www.gamerpower.com/api/filter?platform=epic-games-store.steam&type=game');
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const games = await response.json();

    if (!games || games.length === 0) {
      console.log('No free games found today.');
      return;
    }

    // 2. Build the HTML template
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

    // 3. Setup SMTP transporter using GitHub environment secrets
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO, // Comma-separated list of your destination emails
      subject: '🔥 Free Games Update: Steam & Epic Games',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

  } catch (error) {
    console.error('Workflow execution failed:', error);
    process.exit(1); 
  }
}

sendFreeGamesEmail();