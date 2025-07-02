// server.js
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = 3000;

app.use(cors());

const analyticsData = google.analyticsdata('v1beta');
const key = require('./service-account.json'); // Path to your service account JSON

const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: 'https://www.googleapis.com/auth/analytics.readonly'
});

app.get('/analytics', async (req, res) => {
    try {
        const authClient = await auth.getClient();
        const propertyId = '495329912'; // 👈 Replace with your 10-digit GA4 Property ID

        const result = await analyticsData.properties.runReport({
            property: `properties/${propertyId}`,
            auth: authClient,
            requestBody: {
                dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'sessions' }, { name: 'totalUsers' }]
            }
        });

        res.json(result.data);
    } catch (err) {
        console.error('Error fetching analytics data:', err);
        res.status(500).send('Failed to fetch analytics data');
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

