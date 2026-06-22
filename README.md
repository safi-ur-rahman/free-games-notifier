# 🎮 Free Games Email Notifier

An automated, serverless notification system that fetches active game giveaways on **Steam** and the **Epic Games Store** using the GamerPower API and dispatches a compiled HTML digest directly to a list of subscribers daily via GitHub Actions.

## ✨ Features

- **100% Free & Serverless**: Runs completely on GitHub Actions without needing an active server or database.
- **Auto-Aggregated Emails**: Compiles all ongoing giveaways into a single, clean HTML email instead of sending individual spam messages.
- **Fail-Safe Scheduling**: Configured via cron to run automatically once a day at midnight (00:00 UTC).

---

## 🚀 Setup & Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a Gmail account with **2-Step Verification** enabled.

### 2. Local Installation
Clone the repository and install the required dependencies:

```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install