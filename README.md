# Members Only 🔒

An exclusive web application built with **Node.js, Express, EJS, and PostgreSQL** where users can sign up, log in, post messages, and unlock secret club status using a passcode. 

## ✨ Features

- **User Authentication:** Secure signup and login workflows powered by **Passport.js** (Local Strategy) and **Bcrypt** for password hashing.
- **Role-Based Access Control:** 
  - *Guests* can view messages anonymously.
  - *Logged-in Users* can post new messages.
  - *Club Members* can see who authored each message and when it was posted.
- **Secret Passcode Verification:** Users can enter a secret club passcode to upgrade their membership status.
- **Input Validation & Sanitization:** Robust form validation and cleaning using **express-validator**.
- **Database Management:** Automated schema setup scripts connecting to PostgreSQL.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Templating Engine:** EJS
- **Database:** PostgreSQL (`pg`)
- **Authentication:** Passport.js, Express-Session, Bcrypt
- **Validation:** Express-Validator
- **Environment Management:** Dotenv

---

## 🚀 Getting Started Locally

Follow these steps to set up and run the project on your local machine.

### 1. Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- PostgreSQL (running locally or a cloud database URL like Neon)

### 2. Clone the Repository
```bash
git clone [https://github.com/your-username/members-only.git](https://github.com/your-username/members-only.git)
cd members-only

install dependencies:
npm install

configure environmental variables:
PORT=3000
DATABASE_URL=your_postgresql_connection_string_here
SESSION_SECRET=your_super_secret_session_key
CLUB_PASSCODE=your_secret_club_passcode

setup database:
npm run seed

run the application:
npm run dev
