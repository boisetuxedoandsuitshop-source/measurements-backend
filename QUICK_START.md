# Quick Start Guide

Follow these steps to get your measurements backend up and running.

## Phase 1: Setup (Do Once)

### 1️⃣ Set Up Database (Neon - Free)
- [ ] Go to https://neon.tech and sign up
- [ ] Create a new project called "boise-tuxedo-measurements"
- [ ] Copy your connection string (looks like `postgresql://...`)

### 2️⃣ Set Up Email (Gmail App Password)
- [ ] Go to https://myaccount.google.com/security
- [ ] Make sure 2-Factor Authentication is ON
- [ ] Go to App passwords (under Security)
- [ ] Select "Mail" and "Windows Computer"
- [ ] Copy the 16-character password

### 3️⃣ Create .env File
- [ ] In `measurements-backend` folder, create a file named `.env`
- [ ] Copy this and fill in your values:

```
DATABASE_URL=your_neon_connection_string_here
EMAIL_USER=boisetuxedoshop@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here
EMAIL_FROM=boisetuxedoshop@gmail.com
ADMIN_PASSWORD=teamtux
NODE_ENV=production
```

## Phase 2: Deploy (Do Once)

### 4️⃣ Push to GitHub
```bash
cd C:\shopify\boisetuxedo\measurements-backend
git init
git add .
git commit -m "Initial measurements backend"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 5️⃣ Deploy to Vercel
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Import your repository
- [ ] Add these environment variables:
  - DATABASE_URL
  - EMAIL_USER
  - EMAIL_PASSWORD
  - EMAIL_FROM
  - ADMIN_PASSWORD
- [ ] Click Deploy
- [ ] Wait for deployment to complete
- [ ] You'll get a URL like `https://your-project.vercel.app`

## Phase 3: Integration (Do Once)

### 6️⃣ Update Shopify Forms
- [ ] Read `SHOPIFY_INTEGRATION.md`
- [ ] Update your product page measurement form
- [ ] Create or update the dedicated measurements page
- [ ] Replace `YOUR_VERCEL_URL` with your actual URL (from step 5)

### 7️⃣ Test Everything
- [ ] Submit a test measurement from product page
- [ ] Check your email for notification
- [ ] Log into admin dashboard (`https://your-vercel-url/`)
- [ ] Login with: `teamtux`
- [ ] Verify measurement appears in dashboard
- [ ] Submit a test from measurements page
- [ ] Verify it also appears

## Phase 4: Ongoing Management

### Admin Dashboard
**URL:** `https://your-vercel-url/`  
**Password:** `teamtux`

**What you can do:**
- 📊 View all measurements in a table
- 🔍 Search by name or email
- 📅 Filter by wedding name
- 🖨️ Print measurements
- 📄 Export (copy/paste to Excel)
- 🗑️ Delete measurements

### Email Notifications
- You'll get an email for each new measurement submitted
- Includes all measurements and customer info
- Formatted nicely for reading

### Making Changes
If you need to:
- **Change password**: Edit `.env`, change `ADMIN_PASSWORD`, redeploy
- **Change email address**: Edit `.env`, update `EMAIL_USER`, redeploy
- **Add new fields**: More complex - read README.md section on customization

## Troubleshooting Checklist

**Email not working?**
- [ ] 2FA is ON on Gmail
- [ ] App password is correct (16 chars)
- [ ] Check Vercel logs for errors

**Measurements not appearing?**
- [ ] Check form is POSTing to correct API URL
- [ ] Verify database connection string
- [ ] Check browser console for errors

**Can't log into admin dashboard?**
- [ ] Password is exactly `teamtux`
- [ ] Refresh the page
- [ ] Clear browser cookies

**Form submissions failing?**
- [ ] API URL in form matches your Vercel URL
- [ ] All required fields are filled
- [ ] Check browser console for errors

## Need Help?

1. **Check logs in Vercel dashboard** - shows errors
2. **Test locally** - run `npm run dev` to test before deploying
3. **Read README.md** - detailed documentation
4. **Read SHOPIFY_INTEGRATION.md** - specific form integration help

## Success Checklist ✅

- [ ] Database is created and connected
- [ ] Email is working (you got a test email)
- [ ] Backend deployed to Vercel
- [ ] Shopify forms are updated
- [ ] Test submission worked end-to-end
- [ ] Can log into admin dashboard
- [ ] Can see submissions in dashboard
- [ ] Can print measurements

**You're done! Your measurements system is now live.** 🎉

---

**Your Vercel URL:** Write it down here for easy reference:
```
https://______________________________________.vercel.app
```

**Admin Dashboard Login:**
- URL: The above URL
- Password: `teamtux`
