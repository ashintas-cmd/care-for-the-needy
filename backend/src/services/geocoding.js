const axios = require('axios');
const { logger } = require('../utils/logger');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        logger.warn('Google Maps API key not set, skipping geocoding');
        return null;
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          address: address,
          key: this.apiKey,
          region: 'in'
        },
        timeout: 10000
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;

        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: result.formatted_address,
          confidence: this.calculateConfidence(result),
          placeId: result.place_id
        };
      }

      return null;
    } catch (error) {
      logger.error('Geocoding error:', error.message);
      return null;
    }
  }

  calculateConfidence(result) {
    const types = result.types || [];
    if (types.includes('street_address')) return 'high';
    if (types.includes('route')) return 'high';
    if (types.includes('locality')) return 'medium';
    if (types.includes('administrative_area_level_1')) return 'low';
    return 'low';
  }

  async geocodeBatch(addresses) {
    const results = [];
    for (const address of addresses) {
      const result = await this.geocodeAddress(address);
      results.push(result);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return results;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  async findNearbyTrials(trials, userLat, userLng, radiusKm) {
    return trials.filter(trial => {
      if (!trial.sites) return false;

      return trial.sites.some(site => {
        if (!site.lat || !site.lng) return false;
        const distance = this.calculateDistance(userLat, userLng, site.lat, site.lng);
        return distance <= radiusKm;
      });
    });
  }
}

module.exports = new GeocodingService();
