# Conversa 🌍  
**Live App:** https://conversa-ashy.vercel.app/

Conversa is a language-exchange platform designed to connect people across the world for **real-time language practice**, built with strong emphasis on **product thinking, scalability, and human-centric UX**.

---

## 🚀 Current Features (Implemented)

- **Email-based Authentication**
  - Login with auto-signup
  - Secure session handling using Supabase Auth

- **Protected Routing & Access Control**
  - Route guards for authenticated users
  - Clean separation between public and private routes

- **User Onboarding Flow**
  - Profile creation after first login
  - Language selection
  - Proficiency level selection

- **Human-Centric UI/UX**
  - Emotion-aware design decisions
  - Calm × Friendly visual system
  - Reduced cognitive load and clean spacing

- **Security-First Backend**
  - Row Level Security (RLS) enforced at database level
  - JWT-based authentication
  - Auth identity separated from product profile data

---

## 🧠 Tech Stack

- **Frontend:** Next.js (App Router), TypeScript  
- **Styling:** Tailwind CSS  
- **Backend / Database:** Supabase (PostgreSQL)  
- **Authentication & Security:** Supabase Auth, JWT, RLS  

---

## 🏗️ Architecture Highlights

- Clear separation of **auth identity** and **application user profile**
- Route-level protection for secure navigation
- Database-level authorization using Row Level Security
- Scalable foundation ready for real-time features

---

## 📌 Product Roadmap (Planned)

- Language partner matching
- Real-time chat (WebSockets)
- UX micro-interactions
- AI-assisted language corrections

---

## 📄 Design & System Rationale

Detailed technical and design decisions are documented here:  
`docs/Conversa_Tech_Design_Explanation_FAANG.pdf`

---

Built with a focus on **clarity, scalability, and real-world product standards**.
