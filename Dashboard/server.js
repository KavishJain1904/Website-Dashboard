const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const path = require('path');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Step 1: Start auth flow
app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
    res.redirect(url);
});

// Step 2: Handle Google OAuth callback
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.redirect('/dashboard.html');
});

// Step 3: API to fetch report data
app.get('/api/report', async (req, res) => {
    try {
        const analytics = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });

        const response = await analytics.properties.runReport({
            property: `properties/${process.env.GA4_PROPERTY_ID}`,
            requestBody: {
                dimensions: [{ name: 'pagePath' }],
                metrics: [{ name: 'screenPageViews' }],
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching GA4 data:', error.message);
        res.status(500).json({ error: 'Failed to fetch GA4 data' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
