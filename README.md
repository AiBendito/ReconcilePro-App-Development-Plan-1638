# ReconcilePro - Automated Expense-to-Sales Reconciliation

A comprehensive web application for automating expense-to-sales reconciliation processes with intelligent matching, integrations, and subscription management.

## 🚀 Features

### Core Functionality
- **Automated Matching Engine**: Intelligent algorithm that matches expenses to sales based on amount, date, and fuzzy matching
- **CSV Import**: Drag-and-drop CSV upload with real-time preview and validation
- **Manual Review**: Review suggested matches with confidence scores and manual override options
- **Batch Processing**: Handle large volumes of transactions efficiently

### Authentication & Security
- **Supabase Auth**: Secure email/password authentication with password reset
- **Row Level Security**: Database-level security ensuring users only access their own data
- **Session Management**: Automatic session handling and refresh

### Subscription Management
- **Stripe Integration**: Monthly subscription billing with webhook handling
- **Usage Tracking**: Monitor transaction limits and feature access
- **Billing Portal**: Self-service subscription management

### Integrations
- **Google Drive**: Automatic CSV import from designated folders
- **Slack**: Real-time notifications for matching progress and results
- **GitHub**: Automatic repository setup and code sync
- **Stripe**: Direct sales data import

### Advanced Features
- **Smart Matching**: Multiple matching strategies (amount only, amount + date, fuzzy matching)
- **Configurable Settings**: Adjust date tolerance, matching thresholds, and strategies
- **Activity Feed**: Real-time updates on system activities
- **Export Options**: CSV and Google Sheets export capabilities

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing with hash-based navigation
- **Zustand**: Lightweight state management
- **React Hot Toast**: Beautiful toast notifications

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Supabase Auth**: Authentication and user management
- **Supabase Edge Functions**: Serverless functions for matching logic
- **Row Level Security**: Database-level security policies

### Integrations
- **Stripe**: Payment processing and subscription management
- **Papa Parse**: CSV parsing and processing
- **React Dropzone**: File upload handling
- **ECharts**: Data visualization and reporting

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/reconcile-pro.git
cd reconcile-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. **Database Setup**
Run the SQL schema from `src/config/supabase.js` in your Supabase SQL editor to create all necessary tables, policies, and functions.

5. **Start Development Server**
```bash
npm run dev
```

## 🗄 Database Schema

### Core Tables
- `expenses`: Transaction records for expenses
- `sales`: Transaction records for sales
- `csv_batches`: Batch upload tracking
- `settings`: User preferences and matching configuration
- `subscriptions`: Stripe subscription status
- `integrations`: Third-party service connections

### Key Features
- **UUID Primary Keys**: Secure, non-sequential identifiers
- **Row Level Security**: Users can only access their own data
- **Automatic Timestamps**: Created/updated timestamps on all records
- **Foreign Key Constraints**: Referential integrity for matched transactions

## 🔧 Configuration

### Matching Settings
- **Date Tolerance**: Days within which transactions can be matched
- **Auto-match Threshold**: Minimum confidence score for automatic matching
- **Match Strategy**: Algorithm preference (amount only, amount + date, fuzzy)

### CSV Format Requirements
**Expenses CSV:**
- `date`: Transaction date (YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY)
- `amount`: Transaction amount (numeric)
- `vendor`: Vendor name
- `description`: Transaction description

**Sales CSV:**
- `date`: Transaction date
- `amount`: Transaction amount (numeric)
- `customer`: Customer name
- `description`: Transaction description

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Edge Functions
Deploy the matching algorithm as a Supabase Edge Function:
```bash
supabase functions deploy auto-match-transactions
```

### Database Migrations
Use Supabase CLI to manage database schema changes:
```bash
supabase db reset
supabase db push
```

## 📊 Matching Algorithm

The intelligent matching engine uses a multi-pass approach:

1. **Exact Match**: Same amount and date within tolerance
2. **Amount Match**: Same amount, any date within tolerance
3. **Fuzzy Match**: Similar amounts with description similarity

Each match receives a confidence score (0-100%) based on:
- Amount accuracy (exact vs. approximate)
- Date proximity
- Description similarity
- Vendor/customer name matching

## 🔐 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: Protection against abuse

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode Ready**: CSS variables for easy theme switching
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful error messages and recovery
- **Accessibility**: ARIA labels and keyboard navigation

## 📈 Performance Optimizations

- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo and useMemo for expensive operations
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Supabase real-time subscriptions for live updates

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 API Documentation

### Supabase Edge Functions

**Auto-Match Transactions**
```
POST /functions/v1/auto-match-transactions
```
Triggers the matching algorithm for pending transactions.

**Webhook Handlers**
```
POST /functions/v1/stripe-webhook
```
Handles Stripe subscription events.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@reconcile-pro.com or join our Slack community.

## 🔄 Changelog

### v1.0.0
- Initial release with core reconciliation features
- Supabase integration
- Stripe subscription management
- CSV import/export
- Intelligent matching algorithm

---

**Built with ❤️ by the ReconcilePro Team**