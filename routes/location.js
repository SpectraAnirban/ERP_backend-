const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.IPINFO_API_KEY;

// Haversine distance function
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (angle) => (angle * Math.PI) / 180;
    const earthRadius = 6371000; // Radius of the Earth in meters

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}

function isPointInCircle(centerLat, centerLon, pointLat, pointLon, radius) {
    const distance = haversineDistance(centerLat, centerLon, pointLat, pointLon);
    console.log(`Distance: ${distance} meters`); // Add this line to debug
    return distance <= radius;
}

// Center of the circle
const centerLat = 22.5626;
const centerLon = 88.3630;
const radius = 150; // in meters

router.get('/fetchlocation', async (req, res) => {
    try {
        const response = await axios.get(`https://ipinfo.io?token=${API_KEY}`);
        const location = response.data.loc.split(',');
        const userLat = parseFloat(location[0]);
        const userLon = parseFloat(location[1]);

        console.log(`User Location: ${userLat}, ${userLon}`); // Add this line to debug

        const isWithinCircle = isPointInCircle(centerLat, centerLon, userLat, userLon, radius);
        const status = isWithinCircle ? 'OFFICE' : 'Work-From Home';

        res.json({ ...response.data, status });
    } catch (error) {
        console.error('Error fetching location data:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
});

module.exports = router;
