# EstateFlow Enterprise: Automated Nomba Allocation Plugin for Real Estate

An enterprise B2B SaaS middleware application engineered for the Nigerian real estate sector. It connects Nomba's financial infrastructure directly to corporate CRMs (Airtable/HubSpot) to eliminate manual payment reconciliation delays and automate instant property document allocations.

---

## The Problem
In Nigeria, property buyers making high-ticket installment or full property payments via bank transfers face lengthy manual verification delays. Property firms often take days or weeks to reconcile bank records and manually issue official provisional allocation letters. This causes extreme customer anxiety, data fragmentation, and operational overhead.

## The Solution
EstateFlow automates the entire post-payment pipeline:
1. **Fintech Hook:** The platform provisions unique Nomba Virtual Accounts for prospective buyers.
2. **Secure Verification:** When a payment drops, a Python (Flask) middleware server securely catches and verifies Nomba's cryptographic `nomba-signature` header using the shared signing key.
3. **CRM Sync:** Once validated, the system triggers a ://make.com pipeline to instantly update the buyer's status from `Pending` to `Fully Allocated` in the cloud database.
4. **Instant Fulfillment:** A personalized Provisional Allocation Letter PDF is dynamically generated and instantly dispatched to the customer's WhatsApp line.

---

## Technology Stack
* **Frontend:** React, Tailwind CSS, initialized and prototyped via **Lovable.dev**
* **Backend:** Python (Flask), `python-dotenv`, `flask-cors`
* **Tunneling & Security:** ngrok, HMAC-SHA256 Cryptographic Signature Verification
* **Automation Workflow Engine:** Make.com / n8n
* **Database / CRM:** Airtable / HubSpot CRM

---

## ⚙️ Local Installation & Setup Guide

### 1. Backend Server Setup (Python Flask)
Navigate to your backend directory and follow these steps:

```bash
# Clone the repository and enter the folder
cd estateflow-backend

# Install the required dependencies
pip install -r requirements.txt

# Start the local development server
python app.py
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root of your backend folder and add the following keys:
```env
NOMBA_SIGNING_KEY=NombaHackathon2026
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_PAT=your_airtable_personal_access_token
N8N_WEBHOOK_URL=your_make_or_n8n_webhook_url
```

### 3. Expose Local Server to the Internet (ngrok Tunneling)
Since Nomba's sandbox needs a public HTTPS endpoint to route live payment events, open a second terminal and fire up your ngrok tunnel:
```bash
ngrok http 5000
```
*Copy the forwarding URL generated (e.g., `https://ngrok-free.app`) and paste it into the Webhook configuration section inside your Nomba Developer Dashboard.*

---

##  Cryptographic Webhook Security
To prevent malicious actors from spoofing payloads, our Python backend strictly validates incoming requests using Nomba's structural rules:
* It reads the `nomba-signature` header from the request.
* Computes an **HMAC-SHA256 hex digest** of the raw incoming request body using the `NOMBA_SIGNING_KEY`.
* Uses `hmac.compare_digest()` to securely verify authenticity before processing the payload.

---

##  Authentication & Demo Credentials
To review the live metrics dashboard and interactive inventory tables as a platform administrator, use the following preset credentials:
* **Admin Dashboard Portal URL:https://real-estate-admin-dashboard-iota.vercel.app/.

