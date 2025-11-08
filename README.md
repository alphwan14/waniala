# Waniala - Business Management System

A comprehensive web-based system for tracking Posho Mill operations and Rental income.

## Features

- **Posho Mill Tracker**: Record daily income, expenses, electricity, and savings
- **Monthly Summary**: Automatic calculation of totals and repair fund (10% of income)
- **Rental Tracker**: Manage rental properties, tenants, and payment status
- **Dashboard**: Overview of all business metrics at a glance

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- localStorage (for data persistence)

## Usage

### Posho Mill Tracker
- Add daily records with income, expenses, electricity, and savings
- View monthly summary with automatic calculations
- Add repair fund (10% of monthly income) manually at month end

### Rental Tracker
- Add rental records with room number, tenant name, and rent amount
- Track payment status (Paid/Pending)
- View total expected, collected, and pending amounts

### Dashboard
- Overview of all business metrics
- Quick access to all sections
- Real-time updates

## Data Storage

All data is stored locally in the browser using localStorage. This ensures:
- Offline functionality
- No server required
- Data privacy

## Future Enhancements

- User authentication
- Mobile offline functionality
- Cloud sync
- Export to Excel/PDF



