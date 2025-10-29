# 📝 ConnectWrite

**ConnectWrite** is a full-stack blogging platform where users can share their ideas, write meaningful articles, and connect with others through thoughtful content.

---

## 🚀 Overview

ConnectWrite allows users to **read and explore** articles publicly, but to **create** or **manage** their own blogs, they must sign up and log in.  
Authentication is secured using **email-based OTP verification**, ensuring safe user access and content integrity.

Once logged in, users can:

- Create new blog articles ✍️
- View their published posts 📜
- Update or delete existing articles 🧹
- Upload and display images using Cloudinary 🌩️

Every article is displayed as a **beautiful card**, showing:

- ✒️ Author name
- 🗓️ Date of creation
- 🧾 Title and short description

---

## 💡 Features

- 🌐 Publicly view all articles on the home page
- 🧑‍💻 User authentication via signup/login
- 📧 Email-based OTP verification using Nodemailer
- ✍️ Create, update, delete, and read personal articles
- 🖼️ Image uploads via Multer + Cloudinary
- 🔒 Session-based authentication with JWT
- 🪶 EJS templating for server-side rendering
- 🗄️ MongoDB (via Mongoose) for data storage
- 🪞 Clean UI built with HTML, CSS, and Bootstrap

---

## 🧰 Tech Stack

| Layer                 | Technologies Used                   |
| --------------------- | ----------------------------------- |
| **Frontend**          | HTML, CSS, Bootstrap                |
| **Backend**           | Node.js, Express.js                 |
| **Database**          | MongoDB with Mongoose               |
| **Authentication**    | Sessions, JWT, OTP (via Nodemailer) |
| **File Storage**      | Cloudinary + Multer                 |
| **Templating Engine** | EJS                                 |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/connectwrite.git
cd connectwrite
```
