# Content Calendar Dashboard

Full-stack social media content calendar built with React, Vite, Express.js, and REST API endpoints.

## Features

- Create social media posts from the calendar or New Content button
- Choose platform, content type, date, and exact scheduled time
- Attach an image with preview and remove support
- View scheduled posts on the calendar
- Edit posts before or after publishing
- Track basic published stats: impressions, likes, comments, and shares
- Toggle between calendar and list views

## Tech Stack

- Frontend: React + Vite
- Backend: Express.js
- API: REST
- Icons: lucide-react

## Frontend Structure

```text
client/src/
  main.jsx                 React entry point
  App.jsx                  App shell
  pages/
    DashboardPage.jsx      Main dashboard page and state orchestration
  components/
    CalendarView.jsx       Calendar grid and day/event interactions
    ContentModal.jsx       Create/edit content form
    Header.jsx             Dashboard header
    ListView.jsx           Scheduled content list
    Metrics.jsx            Content status metric cards
    PublishedStats.jsx     Published post analytics strip
    SelectField.jsx        Reusable select control
    ViewToggle.jsx         Calendar/list segmented control
  constants/
    content.js             Platform, status, content type constants
  services/
    contentApi.js          REST API helper functions
  utils/
    content.js             Metrics, grouping, payload helpers
    date.js                Calendar and date formatting helpers
```

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Frontend: http://127.0.0.1:5173
Backend: http://localhost:5000

## Build

```powershell
npm.cmd run build
```
