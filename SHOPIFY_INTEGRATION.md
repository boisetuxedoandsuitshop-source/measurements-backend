# Shopify Integration Guide

This guide explains how to update your Shopify theme forms to use your new measurements backend.

## Overview

You have TWO forms that need to be updated:
1. **Product page form** - for customers buying/renting specific items
2. **Dedicated measurements page form** - for general measurement submissions

Both forms will POST to your new backend API instead of Formspree.

## Step 1: Get Your Backend URL

After deploying to Vercel, you'll have a URL like:
```
https://your-project-name.vercel.app
```

Replace `your-project-name` with your actual Vercel project name.

The form submission endpoint is:
```
https://your-project-name.vercel.app/api/submit-measurements
```

## Step 2: Update the Product Page Measurements Form

The product page form is in: `snippets/bts-measurements.liquid`

This form is currently storing data as Shopify product properties. We need to:
1. Keep the visual form the same
2. Add JavaScript to also POST to your backend API

**Update the JavaScript at the bottom of `bts-measurements.liquid`:**

Replace the existing code that handles the form submission with this updated version. Look for the line:

```javascript
var productForm = document.querySelector('form[action="/cart/add"]');
```

And modify the submit handler to also call your backend:

```javascript
var productForm = document.querySelector('form[action="/cart/add"]');
if (productForm) {
  productForm.addEventListener('submit', function(e) {
    // ... existing validation code ...
    
    // AFTER validation, also send to backend
    if (!hasError) {
      sendMeasurementsToBackend({
        customer_name: document.querySelector('input[name="properties[Customer Name]"]')?.value || 'Website Submission',
        customer_email: document.querySelector('input[name="email"]')?.value || '',
        customer_phone: document.querySelector('input[name="properties[Phone]"]')?.value || '',
        wedding_name: document.querySelector('input[name="properties[Wedding Name]"]')?.value || '',
        order_type: orderTypeInput.value,
        chest: document.getElementById('bts-chest').value,
        overarm: document.getElementById('bts-overarm').value,
        mid_section: document.getElementById('bts-midsection').value,
        waist: document.getElementById('bts-waist').value,
        outseam: document.getElementById('bts-outseam').value,
        neck: document.getElementById('bts-neck').value,
        shirt_sleeve: document.getElementById('bts-shirtsleeve').value,
        height: document.getElementById('bts-height').value,
        weight: document.getElementById('bts-weight').value,
        shoe_size: document.getElementById('bts-shoesize').value,
        jacket_sleeve: document.getElementById('bts-jacketsleeve').value || '',
        shoe_width: document.getElementById('bts-shoe-width').value,
        preferred_fit: document.getElementById('bts-fit').value,
        special_requests: document.querySelector('textarea[name="properties[Special Requests]"]')?.value || '',
        pickup_date: document.getElementById('bts-pickup-date')?.value || '',
        return_date: document.getElementById('bts-return-date')?.value || '',
      });
    }
  });
}

function sendMeasurementsToBackend(data) {
  const backendUrl = 'https://YOUR_VERCEL_URL.vercel.app/api/submit-measurements';
  
  fetch(backendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Measurements submitted to backend:', data);
  })
  .catch(error => {
    console.error('Error submitting to backend:', error);
    // Don't block the cart submission even if backend fails
  });
}
```

**Important:** Replace `https://YOUR_VERCEL_URL.vercel.app` with your actual Vercel URL.

### Optional: Add Customer Name Field

If you want to capture the customer's name, you can add this input to the product form. Add it to `bts-measurements.liquid`:

```liquid
<div class="bts-field">
  <label for="bts-customer-name">Your Name <span style="color:#c0392b">*</span></label>
  <input type="text" id="bts-customer-name" name="properties[Customer Name]" placeholder="e.g. John Smith" required>
</div>
```

Then update the JavaScript to capture it:
```javascript
customer_name: document.getElementById('bts-customer-name').value || 'Website Submission',
```

## Step 3: Create or Update the Dedicated Measurements Page

The dedicated page is at: `/pages/submit-measurements`

This page can be managed through Shopify Admin, but you need to add a form that POSTs to your backend.

### Option A: Use Shopify Page Editor (Easiest)

1. Go to Shopify Admin → Pages
2. Find or create "Submit Measurements"
3. Add a Custom HTML section with this code:

```html
<form id="measurements-form" style="max-width: 800px; margin: 40px auto;">
  <h2 style="margin-bottom: 30px;">Submit Your Measurements</h2>
  
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Name <span style="color: red;">*</span></label>
      <input type="text" name="customer_name" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Email</label>
      <input type="email" name="customer_email" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Phone</label>
      <input type="tel" name="customer_phone" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Wedding/Event Name</label>
      <input type="text" name="wedding_name" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
  </div>

  <h3 style="margin-top: 30px; margin-bottom: 20px;">Your Measurements (inches)</h3>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Chest <span style="color: red;">*</span></label>
      <input type="number" name="chest" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Overarm <span style="color: red;">*</span></label>
      <input type="number" name="overarm" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Mid Section <span style="color: red;">*</span></label>
      <input type="number" name="mid_section" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Waist <span style="color: red;">*</span></label>
      <input type="number" name="waist" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Outseam <span style="color: red;">*</span></label>
      <input type="number" name="outseam" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Neck <span style="color: red;">*</span></label>
      <input type="number" name="neck" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Shirt Sleeve <span style="color: red;">*</span></label>
      <input type="number" name="shirt_sleeve" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Jacket Sleeve</label>
      <input type="number" name="jacket_sleeve" step="0.5" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Height <span style="color: red;">*</span></label>
      <input type="text" name="height" placeholder="e.g. 5'11\"" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Weight (lbs) <span style="color: red;">*</span></label>
      <input type="number" name="weight" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
    <div>
      <label style="display: block; margin-bottom: 8px; font-weight: bold;">Shoe Size <span style="color: red;">*</span></label>
      <input type="number" name="shoe_size" step="0.5" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Special Requests</label>
    <textarea name="special_requests" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: inherit;"></textarea>
  </div>

  <button type="submit" style="background: #cc0000; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Submit Measurements</button>
</form>

<script>
  document.getElementById('measurements-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    fetch('https://YOUR_VERCEL_URL.vercel.app/api/submit-measurements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Thank you! Your measurements have been submitted successfully.');
        document.getElementById('measurements-form').reset();
      } else {
        alert('Error: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error submitting your measurements. Please try again.');
    });
  });
</script>
```

**Important:** Replace `https://YOUR_VERCEL_URL.vercel.app` with your actual Vercel URL.

## Step 4: Test Your Integration

1. **Test the product page form:**
   - Go to a product page
   - Fill out the measurements form
   - Add to cart
   - Check your email - you should receive a notification
   - Log in to the admin dashboard and verify the measurement appears

2. **Test the measurements page form:**
   - Go to `/pages/submit-measurements`
   - Fill out and submit the form
   - Check your email
   - Log in to the admin dashboard

## Troubleshooting

### Form submissions aren't being received?
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try submitting the form again
4. Look for any error messages
5. Check that the API URL is correct

### Email isn't being sent?
1. Check Vercel logs for errors
2. Verify Gmail app password is correct
3. Make sure 2FA is enabled on your Gmail account

### Admin dashboard shows submissions but they're incomplete?
1. Make sure all required fields are being sent from the form
2. Check the field names match exactly (they're case-sensitive)
3. Verify the API response in browser console

## Field Name Reference

When creating forms, use these exact field names:

| Field | Name | Type | Required |
|-------|------|------|----------|
| Name | `customer_name` | text | Yes |
| Email | `customer_email` | email | No |
| Phone | `customer_phone` | tel | No |
| Wedding Name | `wedding_name` | text | No |
| Order Type | `order_type` | text | No |
| Chest | `chest` | number | Yes |
| Overarm | `overarm` | number | Yes |
| Mid Section | `mid_section` | number | Yes |
| Waist | `waist` | number | Yes |
| Outseam | `outseam` | number | Yes |
| Neck | `neck` | number | Yes |
| Shirt Sleeve | `shirt_sleeve` | number | Yes |
| Jacket Sleeve | `jacket_sleeve` | number | No |
| Height | `height` | text | Yes |
| Weight | `weight` | number | Yes |
| Shoe Size | `shoe_size` | number | Yes |
| Shoe Width | `shoe_width` | text | No |
| Preferred Fit | `preferred_fit` | text | No |
| Special Requests | `special_requests` | textarea | No |
| Pickup Date | `pickup_date` | date | No |
| Return Date | `return_date` | date | No |

## Next Steps

After integration:
1. Remove the old Formspree form if you have one
2. Test both forms thoroughly
3. Monitor emails and admin dashboard for submissions
4. Share the admin dashboard link with team members who need to view measurements

Done! Your new measurement system is live. 🎉
