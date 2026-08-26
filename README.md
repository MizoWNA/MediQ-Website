# MediQ

> A modern digital platform built for medical students, educators, and the MediQ community.

MediQ is a medical education platform designed to bring learning resources, mentorship, and academic support together in one place.

The website combines a modern, responsive frontend with a structured backend system for managing users, mentorship, academic resources, and platform content.

---

## ✦ Overview

MediQ was created with a simple goal:

**Make medical education easier to access, easier to navigate, and more connected.**

The platform provides students with a central place to access educational resources and mentorship while giving the MediQ team the tools needed to manage the platform behind the scenes.

The website is designed around a clean, modern interface with a strong focus on usability, responsiveness, and visual consistency.

---

## ✨ Features

### 🎓 Student Experience

- Structured access to medical education resources
- Academic content organized by year, module, and subject
- Notes, lectures, and examination resources
- Mentorship support
- Personalized student information
- Academic timeline and examination information
- Responsive interface for desktop and mobile

### 👨‍🏫 Mentorship

MediQ includes a dedicated mentorship system connecting students with mentors.

Mentors can be assigned directly to students through the administration system, allowing the platform to maintain structured mentor relationships.

### 🛠️ Administration

The platform includes an administrative dashboard for managing users and platform data.

Current functionality includes:

- User creation
- User editing
- Role management
- Student / mentor management
- Mentor assignment
- Academic year management
- Student start and end dates
- Examination dates
- Username management
- Password management
- User search
- Role filtering
- Paginated user listings

Administrative actions are protected through authenticated admin access.

---

# 🖥️ Frontend

The MediQ frontend is built around a modern component-based architecture with an emphasis on:

- Responsive design
- Reusable UI components
- Clean visual hierarchy
- Smooth interactions
- Accessible layouts
- Mobile-first considerations
- Consistent typography and spacing
- Modern animations and visual elements

The landing page uses a modular section-based architecture, making individual sections easy to maintain and evolve independently.

### Landing Page

The public-facing website includes sections such as:

- Hero
- Features
- How It Works
- Infrastructure
- Integrations
- Metrics
- Testimonials
- Pricing
- Security
- Developers
- Call to Action
- Footer

---

## 📸 Screenshots

### Landing Page

<!-- Replace the placeholder below with a screenshot -->

![MediQ Landing Page](./screenshots/landing-page.png)

---

### Features

![MediQ Features](./screenshots/features.png)

---

### Mentorship

![MediQ Mentorship](./screenshots/mentorship.png)

---

### Admin Dashboard

![MediQ Admin Dashboard](./screenshots/admin-dashboard.png)

---

### User Management

![MediQ User Management](./screenshots/user-management.png)

---


# 🧩 Architecture

The application is built using a modern web stack centered around React and Next.js.

### Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide Icons**
- Reusable component architecture

### Backend

- **Next.js API Routes**
- **Supabase**
- Supabase Authentication
- PostgreSQL database
- Server-side administrative operations

### Deployment

- **Vercel**
- **GitHub**

The project uses Git for version control and GitHub as the source repository, with Vercel handling deployment.

---

# 🔐 Authentication & Security

Authentication is handled through Supabase Auth.

Administrative API endpoints verify:

1. A valid authentication session
2. The authenticated user's profile
3. The user's administrative role

Sensitive administrative operations are performed server-side using the Supabase admin client.

Passwords are never stored directly in the application database and are handled through Supabase Authentication.

---

# 🎨 Design

The MediQ interface follows a minimal, modern visual language designed around medical technology and education.

The design system emphasizes:

- High contrast
- Clean layouts
- Subtle borders
- Rounded UI elements
- Blue / green accent colors
- Motion used as visual feedback rather than decoration
- Responsive layouts across screen sizes

The frontend also includes custom animated visual components used throughout the landing page.

---

# 📱 Responsive Design

MediQ is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

Navigation, layouts, cards, tables, and administrative interfaces adapt to smaller screens rather than relying on desktop-only layouts.

---
