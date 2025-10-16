# frontend-web-dev-summative--Umutoni123-aa-

Student Finance Tracker
The Student Finance Tracker. A simple web application designed for students in need of a straightforward tool to manage their finances effectively. Whether you're tracking daily expenses, managing your budget, or analyzing your spending, this tool makes it easy to find what you need and take control of your financial life.

![alt text](wireframes.png)

## Features Implemented

### 1. **Pages/Sections**

- **About Page**: Contains project description, name (Umutoni Nada), and contact info
- **Dashboard**: Stats showing total spent, transaction count, top category, budget progress
- **Transactions Table** (Desktop): Sortable table with edit/delete actions
- **Transactions Cards** (Mobile): Responsive card layout for mobile devices
- **Settings**: Budget and currency exchange rates

Getting Started
Prerequisites
No server or database required - runs entirely in the browser

Usage
Adding a Transaction
Click on the "Add Transaction" button in the navigation
Fill in the transaction details:
Description
Amount (positive for income, negative for expenses)
Category (select from the dropdown or type a new one)
Date (defaults to today)
Click "save Transaction" to save

Managing Transactions
Edit: Click the pencil icon next to any transaction
Delete: Click the trash icon to remove a transaction
Search: Use the search bar to find specific transactions
Filter: Use the category dropdown to filter transactions
Sort: Click on column headers to sort the transaction list

Dashboard
The dashboard provides an overview of your finances:

Total balance
Spending by category
Recent transactions
Monthly spending trends
Settings
Customize the app to your preferences:

Change currency (USD, EUR, GBP)
Set a budget
Manage categories
Import/Export your data
Data Privacy
All your financial data is stored locally in your web browser's localStorage. None of your data is sent to any server.

Keyboard Navigation
The app is fully keyboard accessible:

Tab: Navigate between interactive elements
Enter/Space: Activate buttons and links
Escape: Close modals and dialogs
Arrow keys: Navigate between form fields and table rows
Regular Expressions Used

## 📁 Project Structure

```
student-finance-tracker/
├── index.html              * Homepage
├── about.html              * About page with contact info
├── dashboard.html          * budget dashboard
├── transactions.html       * Main transactions page
├── settings.html           * Settings and data management
├── tests.html              * Regex testing page
├── seed.json               * Sample data
├── README.md               * This file
│
├── styles/
│   └── main.css            * All styles (responsive, accessible)
│
├── scripts/
│   ├── storage.js          * LocalStorage operations
│   ├── state.js            * Application state management
│   ├── validators.js       * Regex validation functions
│   ├── search.js           * Search and sort logic
│   └── ui.js               * DOM manipulation and event handling
│
└── assets/
    └── wireframes.png      * Initial design sketches
```

Acknowledgments
Built with vanilla JavaScript, HTML5, and CSS3
Icons by Font Awesome
Contact Information
Developer: Umutoni Nada
Email: u.nada@alustudent.com
GitHub: github.com/Umutoni123-aa
Course: Frontend Web Development
Year: 2025
