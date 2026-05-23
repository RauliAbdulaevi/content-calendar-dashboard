# Content Calendar Dashboard

Full-stack social media content calendar built with React, Vite, Express.js, JWT authentication, role-based access control, and REST API endpoints.

## Features

- Login and registration
- User and admin roles
- Protected dashboard and admin routes
- Create social media posts from the calendar or New Content button
- Choose platform, content type, date, and exact scheduled time
- Attach an image with preview and remove support
- View scheduled posts on the calendar
- Edit and delete content ideas
- Track basic published stats: impressions, likes, comments, and shares
- Toggle between calendar and list views
- Admin panel for user role changes, user deletion, and all-content visibility
- Admin overview metrics and recent activity log
- API test coverage for auth, admin access, and content idea permissions
- Environment-based frontend API and backend CORS configuration
- Auto-restarting development server for backend changes

## Demo Accounts

```text
Admin: admin@example.com / admin123
User:  user@example.com / user123
```

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Express.js
- Auth: JWT + bcrypt
- API: REST
- Storage: JSON file for local development
- Icons: lucide-react

## Frontend Structure

```text
client/src/
  main.jsx                 React entry point with BrowserRouter and AuthProvider
  App.jsx                  Route definitions
  pages/
    LoginPage.jsx          Login form
    RegisterPage.jsx       Registration form
    DashboardPage.jsx      Main calendar dashboard
    AdminPage.jsx          Admin user/content management
  components/
    AuthLayout.jsx         Shared auth page layout
    ProtectedRoute.jsx     Auth/admin route guard
    RoleBadge.jsx          User/admin badge
    CalendarView.jsx       Calendar grid and day/event interactions
    ContentModal.jsx       Create/edit/delete content form
    Header.jsx             Dashboard header with user controls
    ListView.jsx           Scheduled content list
    Metrics.jsx            Content status metric cards
    PublishedStats.jsx     Published post analytics strip
    SelectField.jsx        Reusable select control
    ViewToggle.jsx         Calendar/list segmented control
  context/
    AuthContext.jsx        Logged-in user and token state
  constants/
    content.js             Platform, status, content type constants
  services/
    authApi.js             Login/register/me/token helpers
    contentApi.js          Protected content API helpers
    userApi.js             Admin user API helpers
  utils/
    content.js             Metrics, grouping, payload helpers
    date.js                Calendar and date formatting helpers
```

## Backend Structure

```text
server/
  index.js                 Starts the HTTP server
  app.js                   Express app, middleware, routes, error handling
  config/
    env.js                 Runtime configuration
  controllers/
    authController.js      Auth request/response handlers
    ideaController.js      Content idea request/response handlers
    userController.js      Admin user request/response handlers
  services/
    authService.js         Login, register, JWT, current user logic
    ideaService.js         Idea ownership, create, update, delete logic
    userService.js         Admin user listing, roles, deletion logic
  repositories/
    dataStore.js           JSON file persistence layer
  data/
    db.json                Local JSON storage
  middleware/
    authMiddleware.js      requireAuth and requireAdmin
    errorMiddleware.js     Central not-found and error responses
  models/
    store.js               Compatibility data helpers
    User.js                Role validation helpers
    Idea.js                Idea access and stats helpers
  routes/
    authRoutes.js          /api/auth/register, /api/auth/login, /api/auth/me
    ideaRoutes.js          Protected /api/ideas routes
    userRoutes.js          Admin-only /api/users routes
  utils/
    AppError.js            Operational error class
    asyncHandler.js        Async controller wrapper
```

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Frontend: http://127.0.0.1:5173
Backend: http://localhost:5000

Copy `.env.example` to `.env` before changing local ports, secrets, request limits, or the frontend API URL.

## Build

```powershell
npm.cmd run build
```

## Quality Checks

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run format
```

The API tests temporarily exercise the local JSON store and restore the original file after the run.

## Environment Variables

```text
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
JSON_LIMIT=10mb
CLIENT_ORIGIN=
VITE_API_URL=http://localhost:5000/api
```

## Deployment Notes

- Set a strong `JWT_SECRET` in production.
- Set `CLIENT_ORIGIN` to the deployed frontend origin. Leave it blank for local development, or use commas for multiple allowed origins.
- Set `VITE_API_URL` to the deployed backend `/api` URL before building the frontend.
- Run `npm.cmd run build` to create the production frontend bundle in `dist/`.
- The current storage layer is intentionally the local JSON file used for this project demo.
