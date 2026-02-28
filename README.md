# RenovateIQ — Home Renovation Tracker (Frontend)

> A smart, modern web application to plan, track, and manage your home renovation projects from start to finish.


##  Project Description

RenovateIQ is a full-stack home renovation management platform that helps homeowners and contractors efficiently track projects, tasks, expenses, contractors, permits, inventory, shopping lists, and maintenance schedules — all in one place. The frontend is built with React + Vite and connects to a Node.js/Express backend powered by Supabase.

---

##  Features

-  **User Authentication** — Secure login and registration
-  **Project Management** — Create, update, and delete renovation projects
-  **Task Tracking** — Assign and monitor tasks for each project
-  **Expense Tracking** — Log and monitor project expenses
-  **Contractor Management** — Manage contractor details and assignments
-  **Shopping List** — Track materials and supplies needed
-  **Inventory Management** — Monitor available materials and stock
-  **Permit Tracking** — Keep track of permits required for renovation
-  **Maintenance Scheduling** — Schedule and track maintenance tasks
-  **Dashboard Overview** — Get a bird's eye view of all your projects
-  **Responsive Design** — Works seamlessly on desktop and mobile

---

##  Tech Stack Used

| Technology |       Purpose                 |
|------------|-------------------------------|
|  React.js  | Frontend UI framework         |
|  Vite      | Build tool and dev server     |
|ReactRouter | Client-side routing           |
|Fetch API   | HTTP requests to backend      |
|  Tailwind  | Styling and responsive design | 
|  Netlify   | Frontend deployment           |



## Installation Steps

Follow these steps to run the project locally:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Steps

 bash

# 1. Clone the repository
git clone https://github.com/Sarithatammineni/HomeRenovation-Frontend.git

# 2. Navigate into the project folder
cd HomeRenovation-Frontend

# 3. Install dependencies
npm install

# 4. Create a .env file in the root directory
touch .env

Add the following to your `.env` file:

VITE_API_URL=https://homerenovation-backend.onrender.com


# 5. Start the development server

npm run dev
```

The app will be running at `http://localhost:5173`


**Deployment Link**

**Live Application:** [https://rococo-sundae-3872f0.netlify.app](https://rococo-sundae-3872f0.netlify.app)

---

##  Backend API Link

**Backend API:** [https://homerenovation-backend.onrender.com](https://homerenovation-backend.onrender.com)

**Health Check:** [https://homerenovation-backend.onrender.com/api/health](https://homerenovation-backend.onrender.com/api/health)

> **Note:** The backend is hosted on Render's free tier. It may take 30–60 seconds to wake up on the first request after a period of inactivity.



##  Login Credentials (Demo)

Use the following credentials to explore the application:

Role: Demo User
Email:demo@renovateiq.com
Password :demo1234 

> **Note:** You can also register a new account directly from the signup page.


###  Dashboard
![Dashboard](https://github.com/Sarithatammineni/HomeRenovation-Frontend/blob/main/Screenshot%202026-02-28%20222110.png?raw=true)

###  Projects Page
![Projects](https://github.com/Sarithatammineni/HomeRenovation-Frontend/blob/main/Screenshot%202026-02-28%20222135.png?raw=true)

###  Expense Tracker
![Expenses](https://github.com/Sarithatammineni/HomeRenovation-Frontend/blob/main/Screenshot%202026-02-28%20222212.png?raw=true)

###  Contractors Page
![Contractors]()



##  Project Structure


HomeRenovation-Frontend/
├── public/
├── src/
│   ├── components/      Reusable UI components
│   ├── pages/           Page-level components
│   ├── config.js         API base URL configuration
│   ├── App.jsx           Main app component
│   └── main.jsx         Entry point
├── .env                 Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js




##  Available Scripts

```bash:

npm run dev       
   -Start development server

npm run build 
    - Build for production

npm run preview   
    - Preview production build locally



## Environment Variables

Variable :`VITE_API_URL`

Description :Backend API base URL

---

##  Author

**Sarithatammineni**
- GitHub: [@Sarithatammineni](https://github.com/Sarithatammineni)




##  License

This project is open source and available under the [MIT License](LICENSE).

