# Boise Tuxedo - Measurements Backend

Complete backend system for collecting and managing customer measurements for Boise Tuxedo Shop.

## What This Does

- **Form Submissions**: Customers submit measurements via your website
- **Database Storage**: All measurements stored in PostgreSQL
- **Email Notifications**: You get emailed when someone submits measurements
- **Admin Dashboard**: Login to view, search, filter, and print all measurements
- **Organized by Wedding**: Tag measurements by wedding/event for easy organization

## Features

✅ Receive form submissions from Shopify website  
✅ Automatically send you email notifications  
✅ Store all data in your own database (not a third-party service)  
✅ Admin dashboard to view/search measurements  
✅ Print-friendly interface  
✅ Delete measurements as needed  
✅ Filter by wedding, name, date  
✅ **Zero monthly costs** - everything on free tiers  

## Setup Instructions

### Step 1: Set Up PostgreSQL Database

We'll use **Neon** (free PostgreSQL hosting):

1. Go to https://neon.tech
2. Sign up with your email
3. Create a new project (name it "boise-tuxedo-measurements")
4. Copy your connection string (looks like: `postgresql://user:password@host/dbname`)
5. Keep this handy - you'll need it soon

### Step 2: Set Up Gmail App Password

We use your Gmail account to send you email notifications (no third-party email service!):

1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if you haven't already
3. Go back to Security → App passwords
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password
6. Copy this password - you'll need it next

### Step 3: Create .env File

1. In the `measurements-backend` folder, create a file called `.env` (copy from `.env.example`)
2. Fill in the values:

```
DATABASE_URL=your_neon_connection_string_here
EMAIL_USER=boisetuxedoshop@gmail.com
EMAIL_PASSWORD=your_16_char_app_password_here
EMAIL_FROM=boisetuxedoshop@gmail.com
ADMIN_PASSWORD=teamtux
NODE_ENV=production
```

### Step 4: Install Dependencies

```bash
cd measurements-backend
npm install
```

(Already done if you ran the initial setup!)

### Step 5: Initialize Database

The database will automatically create tables when you first run the server. You can also manually create the tables by running:

```bash
npm run init-db
```

### Step 6: Run Locally (Testing)

```bash
npm run dev
```

Visit http://localhost:3000 to see the admin dashboard.

Login with password: `teamtux`

### Step 7: Deploy to Production

We'll deploy to **Vercel** (same company that makes Next.js, free tier):

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial measurements backend"
   git remote add origin your_github_repo_url
   git push -u origin main
   ```

2. Go to https://vercel.com
3. Sign up (or login with GitHub)
4. Click "New Project" and import your GitHub repository
5. Add environment variables:
   - Click "Environment Variables"
   - Add DATABASE_URL, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, ADMIN_PASSWORD
6. Click Deploy

Your backend is now live! You'll get a URL like `https://your-project.vercel.app`

## API Endpoints

### POST /api/submit-measurements
**Receives form submissions from your website**

Request body:
```json
{
  "customer_name": "John Smith",
  "customer_email": "john@example.com",
  "customer_phone": "208-555-1234",
  "wedding_name": "Sarah & Mike",
  "order_type": "Rental",
  "chest": 42,
  "overarm": 46,
  "mid_section": 38,
  "waist": 36,
  "outseam": 42,
  "neck": 16,
  "shirt_sleeve": 33,
  "height": "5'11\"",
  "weight": 185,
  "shoe_size": 10.5,
  "jacket_sleeve": 32,
  "shoe_width": "Medium",
  "preferred_fit": "Regular",
  "special_requests": "Any special notes...",
  "pickup_date": "2026-07-15",
  "return_date": "2026-07-20"
}
```

### GET /api/get-measurements
**Retrieve measurements (requires password)**

Query params:
- `password`: admin password
- `page`: page number (default: 1)
- `limit`: results per page (default: 20)
- `search`: search by name or email
- `wedding`: filter by wedding name
- `sortBy`: sort field (submitted_at, customer_name, wedding_name)
- `sortOrder`: ASC or DESC

### DELETE /api/delete-measurement
**Delete a measurement**

Request body:
```json
{
  "id": 5,
  "password": "teamtux"
}
```

### PUT /api/update-measurement
**Mark measurement as viewed**

Request body:
```json
{
  "id": 5,
  "password": "teamtux",
  "viewed": true
}
```

## Updating Your Shopify Forms

You'll need to update your measurement forms to POST to this API instead of Formspree.

See `SHOPIFY_INTEGRATION.md` for detailed instructions on updating:
- Product page measurement forms
- Dedicated measurements page form

## Admin Dashboard

Once deployed, you can access the admin dashboard at:
```
https://your-project.vercel.app/
```

Login with: `teamtux`

Features:
- 📊 View all measurements in a table
- 🔍 Search by customer name or email
- 📅 Filter by wedding/event name
- 🖨️ Print individual measurements or the full dashboard
- 📄 Export data (copy/paste into Excel)
- ✏️ Mark measurements as viewed
- 🗑️ Delete measurements

## Customization

### Change Admin Password

Edit `.env` and change `ADMIN_PASSWORD=teamtux` to your desired password. Redeploy.

### Change Email Address

Edit `.env` and update `EMAIL_USER` and `EMAIL_FROM`. Redeploy.

### Add More Fields

1. Add field to your Shopify form
2. Update the database schema in `lib/db.js`
3. Add field to `/api/submit-measurements.js`
4. Update the email template in `lib/email.js`
5. Update the dashboard in `pages/index.js`

## Troubleshooting

### Email not being sent?
- Check that 2FA is enabled on your Gmail account
- Verify the app password is correct (16 characters)
- Check Vercel logs for errors

### Database connection failing?
- Verify your Neon connection string is correct
- Make sure you copied the full URL including the password

### Measurements not appearing in dashboard?
- Check that you submitted with the correct form (POST to `/api/submit-measurements`)
- Verify database is connected
- Check browser console for errors

## Support

For questions or issues, you can:
1. Check the logs in Vercel dashboard
2. Test locally with `npm run dev`
3. Check that all environment variables are set correctly

## Database Backups

Neon automatically backs up your data. To export:
1. Go to your Neon dashboard
2. Connect to your database using any PostgreSQL client
3. Export as CSV or JSON

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Neon (Database) | Free | 3GB storage, sufficient for thousands of measurements |
| Vercel (Hosting) | Free | Sufficient for your traffic |
| Gmail SMTP | Free | Using your own Gmail account |
| **TOTAL** | **$0** | No monthly subscription needed |

## Next Steps

1. Complete the setup steps above
2. Deploy to Vercel
3. Update your Shopify forms to use the new backend
4. Test by submitting a measurement
5. Check your email and admin dashboard

Enjoy your new measurements system! 🎉
