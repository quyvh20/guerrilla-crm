# Guerrilla CRM - Installation & Setup Guide

This CRM project is designed with 3 main components:
1. **Go Backend Server** (Main data processing API)
2. **AI Worker** (Cloudflare Worker for analyzing Data/Chat via AI)
3. **Chrome Extension** (Captures multi-channel chat information directly from the browser)

Below are the instructions to run each component:

---

## 1. Run Go Backend Server

The backend is built using the Go programming language.

- **Requirements:** Golang installed.
- **Environment variables:** If scaling, you can set up a `.env` file in the same directory as `main.go`. You may need the `AI_WORKER_URL` pointing to the endpoint established in step 2.

**Launch steps:**
1. Open a terminal in the root directory of the `guerrilla-crm` project.
2. Run the application using the command:
   ```bash
   go run main.go
   ```
=> By default, the server will operate on `http://localhost:3000`

---

## 2. Run AI Worker (Cloudflare)

The worker acts as the communication layer with Cloudflare AI according to the configuration in `wrangler.toml`.

- **Requirements:** Node.js and npx installed.

**Local development launch steps:**
1. Open a second terminal tab and navigate to the `ai-worker` directory:
   ```bash
   cd ai-worker
   ```
2. Run the local simulation using Wrangler:
   ```bash
   npx wrangler dev
   ```
=> Wrangler typically starts the simulated worker on port `http://localhost:8787`.

---

## 3. Install Chrome Extension

This extension captures chat framed events from major platforms like Zalo, Messenger, WhatsApp,...

**Steps to add to Chrome:**
1. Open Chrome/Edge/Coc Coc browser, and up in the address bar navigate to:
   ```text
   chrome://extensions/
   ```
2. Look at the top right corner and **enable "Developer mode"**.
3. Click the **"Load unpacked"** button that appears on the top left.
4. Browse and select the entire `chrome-extension` folder within your `guerrilla-crm` project.
5. That's it! You will see the Guerrilla CRM icon appear, and it will start working when you open tabs like Zalo Web / Facebook Messenger.

---
*Note: You must run both step 1 and step 2 concurrently for the entire storage system to sync smoothly!*
