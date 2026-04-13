# HopeHRS

A Human Resource Management System built with React, Vite, and Supabase.

---

##  Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository
- git clone https://github.com/Student-Project-Team/HopeHRS 
- cd HopeHRS
### 2. Install Dependencies
- npm install
### 3. Set Up Environment Variables
- Create a `.env` file in the root of the project and add the following:
  - VITE_SUPABASE_URL=your-supabase-project-url
  - VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
- You can get these values from your Supabase project under
- **Project Settings → API**

### 4. Run the Development Server
- npm run dev
- The app will be available at `http://localhost:5173`

## Supabase Project

Access the database, auth settings, and schema here:
[HopeHRS Supabase Project](https://supabase.com/dashboard/project/yxddgzbvzzvxfuqqcdqn)

## Running Tests
- npm test
- All 4 auth test cases should pass.
