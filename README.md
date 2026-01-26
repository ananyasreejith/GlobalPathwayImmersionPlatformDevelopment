# Global Pathway Immersion Platform

A comprehensive web platform designed to connect students with international educational and career opportunities. This application helps users explore study abroad programs, track applications, and receive guidance from counselors.

## Live Demo
**[Launch Application](https://globalpathwayimmersionplatformdevelopmen.onrender.com)**

##  Features
- **Student Dashboard**: Explore study and work opportunities abroad.
- **Application Tracking**: Real-time status updates for submitted applications.
- **Secure Authentication**: User registration and login with email verification (JWT).
- **Responsive Design**: Mobile-friendly interface for students on the go.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Glassmorphism UI), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **Services**: Nodemailer (Email), Render (Hosting)

##  Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ananyasreejith/GlobalPathwayImmersionPlatformDevelopment.git
    cd GlobalPathwayImmersionPlatformDevelopment
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_HOST=smtp.gmail.com (or other provider)
    EMAIL_PORT=587
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    BASE_URL=http://localhost:3000
    ```

4.  **Run the application:**
    ```bash
    npm run dev
    ```

##  License
This project is open-source and available under the MIT License.
