# Email Capture & Automation Setup Guide

## Recommended Solution: ConvertKit

**Why ConvertKit?**
- ✅ Free up to 1,000 subscribers (you won't hit this limit for months)
- ✅ Visual automation builder (drag-and-drop email sequences)
- ✅ Built for creators/coaches (designed for exactly your use case)
- ✅ Great deliverability (lands in inbox, not spam)
- ✅ Easy form integration (one line of JavaScript)
- ✅ Tag-based segmentation (track who buys vs. who doesn't)

**Estimated Setup Time**: 45 minutes

---

## Step-by-Step Setup Instructions

### STEP 1: Create ConvertKit Account

1. Go to: https://convertkit.com/
2. Click "Get started free"
3. Sign up with your email (use support@wolfwellness.life)
4. Verify your email domain (they'll walk you through this)

---

### STEP 2: Create Form in ConvertKit

1. In ConvertKit dashboard, click **"Grow"** → **"Landing Pages & Forms"**
2. Click **"Create New"** → **"Form"**
3. Choose **"Inline"** form type
4. Design the form:
   - **Fields**: First Name + Email (match your free-reset.html)
   - **Button Text**: "Send Me The Free 3-Day Reset →"
   - **Success Message**: "Check your email! Your 3-Day Reset is on the way."

5. Click **"Settings"**:
   - **Incentive**: Upload the 3-Day PDF here (you'll create this from the full PDF)
   - **Send incentive**: Immediately upon signup

6. Click **"Publish"**

---

### STEP 3: Create the 5-Email Sequence

1. In ConvertKit, go to **"Automate"** → **"Sequences"**
2. Click **"New Sequence"**
3. Name it: "3-Day Reset → Full Program Funnel"

4. Add 5 emails:

**Email 1: Immediate**
- Subject: `Your 3-Day Executive Reset is here 🎯`
- Body: Copy from email-sequence.md
- **Delay**: 0 days (immediate)
- **Attach PDF**: Link to 3-Day PDF

**Email 2: Day 1 Check-In**
- Subject: `Day 1 complete? Here's what most people miss...`
- Body: Copy from email-sequence.md
- **Delay**: 1 day after Email 1

**Email 3: Day 3 Value Bomb**
- Subject: `The science behind why this works (and why most programs don't)`
- Body: Copy from email-sequence.md
- **Delay**: 3 days after Email 1

**Email 4: Day 5 Direct Pitch**
- Subject: `What happens if you stop at Day 3? (Honest answer)`
- Body: Copy from email-sequence.md
- **Delay**: 5 days after Email 1

**Email 5: Day 7 Final Call**
- Subject: `Last call: Days 4-7 (then I'm moving on)`
- Body: Copy from email-sequence.md
- **Delay**: 7 days after Email 1

5. Click **"Publish Sequence"**

---

### STEP 4: Connect Form to Sequence

1. Go back to your form (Step 2)
2. Click **"Settings"** → **"Actions after signup"**
3. Check: **"Subscribe to sequence"**
4. Select: "3-Day Reset → Full Program Funnel"
5. Save

Now when someone opts in, they automatically enter the 5-email sequence.

---

### STEP 5: Integrate ConvertKit Form into free-reset.html

**Option A: Embed ConvertKit Form (Easiest)**

1. In ConvertKit, go to your form → **"Embed"**
2. Copy the **JavaScript embed code**
3. Replace the current form in `free-reset.html` with:

```html
<div id="formContainer">
  <!-- ConvertKit Embed Code -->
  <script async data-uid="YOUR_FORM_UID" src="https://your-username.ck.page/YOUR_FORM_UID/index.js"></script>
</div>
```

**Option B: Custom Integration via API (More Control)**

If you want to keep your custom form design, you can POST to ConvertKit's API:

1. Get your ConvertKit API Key:
   - Go to **Settings** → **Advanced** → **API Key**
   - Copy the key

2. Get your Form ID:
   - Go to your form → URL will show `/forms/12345678` ← that's your form ID

3. Update `free-reset.html` JavaScript:

```javascript
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  try {
    // Submit to ConvertKit
    const response = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: 'YOUR_API_KEY', // Move this to environment variable in production
        email: email,
        first_name: name
      })
    });

    if (!response.ok) throw new Error('Subscription failed');

    // Fire Meta Pixel Lead event
    if (window.fbq) {
      fbq('track', 'Lead', {
        content_name: '3-Day Executive Reset',
        content_category: 'Lead Magnet'
      });
    }

    // Show success message
    formContainer.style.display = 'none';
    successMessage.classList.add('show');

  } catch (error) {
    console.error('Form submission error:', error);
    alert('Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Me The Free 3-Day Reset <span aria-hidden="true">→</span>';
  }
});
```

**IMPORTANT**: Don't hardcode your API key in the frontend. Instead:
- Create a Vercel function at `/api/convertkit-subscribe.js`
- Store API key in Vercel environment variables
- POST to your own API, which then forwards to ConvertKit

---

### STEP 6: Create the 3-Day PDF (Extract from Full 42-Page PDF)

You need to create a condensed version of your 42-page PDF with ONLY Days 1-3.

**Pages to Include**:
1. Cover page
2. Introduction (pages 1-4 from full PDF)
3. Four Pillars explanation (pages 5-6)
4. AM Ritual (pages 7-8)
5. PM Ritual (pages 9-10)
6. Day 1: Foundation Reset + Workout A (pages 11-14)
7. Day 2: Energy Reset + Workout B (pages 15-18)
8. Day 3: Clarity Reset + Workout C (pages 19-22)
9. Nutrition Quick-Start Guide (pages 30-32)
10. High-Performance Habit Scripts (excerpts from pages 33-36)

**Pages to EXCLUDE** (creates desire for full program):
- Days 4-7 workouts
- Advanced recovery protocols (pages 37-40)
- Complete habit transformation framework
- Bonus resources

**How to Create It**:
1. Open the full PDF in Adobe Acrobat or similar
2. Extract pages 1-22 + 30-32 + 33-36
3. Add a final page: "Want Days 4-7? Get the full program: wolfwellness.life/reset.html"
4. Save as: `3-Day-Executive-Reset.pdf`
5. Upload to ConvertKit as the form incentive

**Estimated file size**: ~8-12 pages (vs. 42 in full version)

---

### STEP 7: Test the Full Funnel

1. Go to `wolfwellness.life/free-reset.html`
2. Fill out the form with your own email
3. Verify:
   - ✅ Confirmation email arrives immediately with 3-Day PDF
   - ✅ Email 2 arrives 24 hours later
   - ✅ Meta Pixel Lead event fires (check Events Manager)
   - ✅ Success message appears after form submit

4. If everything works, you're ready to launch.

---

### STEP 8: Update Meta Ads Campaign

**Current Setup** (BROKEN):
- Ad → reset.html ($49 offer) → 0% conversion

**New Setup** (OPTIMIZED):
- Ad → free-reset.html (free opt-in) → 5-10% opt-in rate
- Email sequence → reset.html ($49 offer) → 8-12% conversion
- **Net result**: 0.4-1.2% overall conversion (vs. current 0%)

**How to Update**:

1. Pause Test 3 campaign
2. Duplicate Test 3
3. Change destination URL from `reset.html` to `free-reset.html`
4. Update ad copy to match free offer:
   - **Headline**: "Free: The 3-Day Executive Reset"
   - **Primary Text**: "Reclaim clarity, energy, and daily structure in 72 hours. Get the first 3 days of our proven executive wellness system — completely free. No gym required, no complicated meal plans, just science-backed rituals that fit your schedule."
   - **CTA Button**: "Download Now" (instead of "Shop Now")

5. Launch new campaign
6. Monitor:
   - Lead events (should see 5-10% of landing page viewers)
   - Purchase events (should see 8-12% of leads within 7 days)

---

## Alternative: Use Resend + Custom Automation (Advanced)

If you want to avoid another tool and use Resend (which you already have), you can build the automation yourself:

**Required Work**:
1. Create `/api/convertkit-subscribe.js` Vercel function
2. Store subscriber data in a simple database (Supabase free tier, or even Google Sheets)
3. Create `/api/email-cron.js` to send scheduled emails
4. Set up Vercel Cron Jobs to run daily
5. Track which email each subscriber is on

**Pros**:
- No additional monthly cost
- Full control over timing and content

**Cons**:
- 4-6 hours of development work
- More complex to maintain
- Need to handle unsubscribes manually

**Verdict**: Only do this if you're a developer and want full control. Otherwise, use ConvertKit.

---

## Budget Comparison

| Service | Free Tier | Paid Tier | Best For |
|---------|-----------|-----------|----------|
| **ConvertKit** | Up to 1,000 subscribers | $29/mo for 1,000-3,000 | Creators, coaches (RECOMMENDED) |
| **Beehiiv** | Up to 2,500 subscribers | $49/mo for unlimited | Newsletter-focused businesses |
| **Mailchimp** | Up to 500 subscribers | $13/mo for 500-1,500 | Traditional email marketing |
| **Resend** | 100 emails/day free | $20/mo for 50k emails | Developers who want to build custom |

**Recommendation**: Start with ConvertKit free tier. You won't hit 1,000 subscribers for months, and by then you'll have revenue to justify the $29/mo upgrade.

---

## Expected Results (30 Days)

**Scenario**: $500 Meta Ads budget over 30 days

**Assumptions**:
- $2.50 cost per lead (free download)
- 200 free downloads
- 10% email → $49 conversion rate
- 20 sales at $49 = $980 revenue

**Math**:
- Ad spend: $500
- Revenue: $980
- Profit: $480
- **ROI**: 96%

**Compare to Current Test 3**:
- Ad spend: $105
- Revenue: $0
- Profit: -$105
- **ROI**: -100%

---

## Next Steps

1. **Create ConvertKit account** (15 minutes)
2. **Set up form + sequence** (30 minutes)
3. **Create 3-Day PDF** (30 minutes)
4. **Test the funnel** (15 minutes)
5. **Update Meta Ads** (15 minutes)
6. **Launch and monitor** (ongoing)

**Total setup time**: ~2 hours

**Expected time to first sale**: 5-7 days (after first batch of subscribers hits Email 4)

---

**Questions? Email me (Claude) or reference this guide step-by-step.**
