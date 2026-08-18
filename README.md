# Sepideh Estiri — Personal Portfolio

A modern, responsive personal portfolio website showcasing my experience, technical skills, projects, and work as a **Full-Stack Developer**.

The portfolio includes a complete contact management system with backend API integration, SQLite database storage, email notifications, and a protected admin dashboard for managing received messages.

---

## ✨ Features

* Modern and responsive UI
* Desktop and mobile support
* English / Persian language support
* Dark-themed interface
* Projects showcase
* Skills section
* Professional experience section
* Downloadable resume & portfolio
* GitHub and LinkedIn integration
* Functional contact form
* Server-side form validation
* Contact message storage with SQLite
* Rate limiting for spam protection
* Email notifications through SMTP
* Protected admin dashboard
* Contact message status management
* Secure environment variable configuration

---

## 📨 Contact Management System

The Contact section is connected to a custom backend API.

When a visitor submits a message:

```text
Contact Form
     ↓
Express API
     ↓
Server-side Validation
     ↓
SQLite Database
     ↓
Email Notification
```

Messages are stored in the database before an email notification is attempted, which means a temporary email service failure will not cause submitted messages to be lost.

Each message contains:

* Name
* Email
* Subject
* Message
* Submission date
* Status

Available message statuses:

```text
New → Read → Replied
```

---

## 🔐 Admin Dashboard

The project includes a private message management dashboard:

```text
/admin/messages
```

The dashboard allows the administrator to:

* View contact messages
* View sender information
* See submission dates
* Change message status
* Mark messages as New, Read, or Replied
* Delete messages
* Log out securely

Admin routes are protected and contact messages cannot be retrieved through the public API without authentication.

---

## 🛡️ Security

The contact system includes several security measures:

* Server-side input validation
* Email format validation
* Input length restrictions
* Request rate limiting
* Protected admin endpoints
* Session-based admin authentication
* Environment-based credentials
* Safe handling of user-generated content
* Sensitive files excluded from Git

Private credentials are stored locally using environment variables and are **not included in this repository**.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* SQLite

### Additional Tools

* Nodemailer
* React Router
* Git
* GitHub

---

## 📁 Project Structure

```text
portfolio/
│
├── public/
│
├── server/
│   ├── auth.mjs
│   ├── createApp.mjs
│   ├── db.mjs
│   ├── mail.mjs
│   ├── rateLimit.mjs
│   ├── validate.mjs
│   └── viteContactApiPlugin.mjs
│
├── src/
│   ├── App.tsx
│   ├── AdminMessages.tsx
│   └── i18n.ts
│
├── data/
│   └── contact.db        # Generated locally / ignored by Git
│
├── .env.example
├── .gitignore
├── package.json
└── vite.config.ts
```

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/SeaGirl-pj/sepideh-estiri-portfolio.git
```

Go to the project directory:

```bash
cd sepideh-estiri-portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL displayed by Vite in your browser.

---

## ⚙️ Environment Variables

Create a local `.env.local` file.

Use `.env.example` as a reference.

Example:

```env
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
CONTACT_RECEIVER_EMAIL=
```

> Never commit `.env.local`, Gmail App Passwords, admin passwords, session secrets, or other credentials to GitHub.

For Gmail SMTP, `SMTP_PASSWORD` should contain a **Google App Password**, not the normal Gmail account password.

---

## 📦 Production Build

Create a production build with:

```bash
npm run build
```

Start the production application with:

```bash
npm start
```

---

## 👩‍💻 About Me

I'm **Sepideh Estiri**, a developer with experience in Python and web application development.

My technical experience includes:

* Python
* Django
* JavaScript
* Node.js
* React
* HTML & CSS
* Database-backed web applications
* Full-stack application development

I enjoy designing and developing practical applications that combine clean user interfaces with functional backend systems.

I'm also expanding my knowledge in **Data Analysis and Machine Learning**.

---

## 🔗 Connect With Me

**GitHub**
[github.com/SeaGirl-pj](https://github.com/SeaGirl-pj)

**LinkedIn**
[Sepideh Estiri](https://www.linkedin.com/in/sepideh-estiri-a08201317/)

---

## 📄 License

This project is my personal portfolio and is intended to showcase my work and experience.

© 2026 Sepideh Estiri
