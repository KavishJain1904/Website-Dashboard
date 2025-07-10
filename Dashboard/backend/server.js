// server.js
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const port = 3000;

app.use(cors());

const analyticsData = google.analyticsdata('v1beta');
const key = require('./service-account.json'); // ✅ Your service account JSON file

const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: 'https://www.googleapis.com/auth/analytics.readonly'
});

// ✅ Real-Time Analytics Endpoint
app.get('/realtime', async (req, res) => {
    try {
        const authClient = await auth.getClient();
        const propertyId = '495329912'; // ✅ Your GA4 Property ID

        const response = await analyticsData.properties.runRealtimeReport({
            property: `properties/${propertyId}`,
            auth: authClient,
            requestBody: {
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }]
            }
        });

        res.json(response.data || {});
        console.log('Realtime data sent:', response.data);
    } catch (error) {
        console.error('Error fetching realtime analytics:', error);
        res.status(500).send('Failed to fetch realtime data');
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});


