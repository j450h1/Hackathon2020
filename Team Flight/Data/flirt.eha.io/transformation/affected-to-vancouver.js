/**
 * mongo script to extract schedules from corona affected contries to Vancouver
 * Note: This script is to be run inside mongo shell or any mongo GUI client
 */

// countries extracted from https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
let affectedAreas = ['Mainland China', 'South Korea', 'Others', 'Italy', 'Japan', 'Singapore', 'Hong Kong', 'Iran', 'US', 'Thailand', 'Taiwan', 'Australia', 'Malaysia', 'Germany', 'Vietnam', 'United Arab Emirates', 'UK', 'France', 'Canada', 'Macau', 'Kuwait', 'Spain', 'Philippines', 'India', 'Bahrain', 'Russia', 'Oman', 'Afghanistan', 'Nepal', 'Cambodia', 'Israel', 'Belgium', 'Lebanon', 'Finland', 'Sweden', 'Iraq', 'Egypt', 'Sri Lanka'];

// 'Others' contryName is not in database
affectedAreas = affectedAreas.filter((c) => c !== 'Others');

// map contry names to country names in schedules
const map = {
  'Mainland China': 'China',
  US: 'United States',
  UK: 'United Kingdom',
};
affectedAreas = affectedAreas.map((c) => map[c] || c);

// Export the result from this query to csv with all fields
db.schedules.aggregate([
  {
    $match:
        {
          'departureAirport.countryName': { $in: affectedAreas },
          'arrivalAirport.city': 'Vancouver',
        },
  },
  // extract fields for csv
  {
    $addFields: {
      flightId: { $concat: ['$carrier', '-', { $toString: '$flightNumber' }] },

      // extract $departureAirport
      departureID: '$departureAirport._id',
      departureName: '$departureAirport.name',
      departureCoordinates: '$departureAirport.loc.coordinates',
      departureCity: '$departureAirport.city',
      departureStateID: '$departureAirport.state',
      departureStateName: '$departureAirport.stateName',
      departureCountry: '$departureAirport.countryName',
      departureGlobalRegion: '$departureAirport.globalRegion',
      departureWAC: '$departureAirport.WAC',
      departureNotes: '$departureAirport.notes',

      // extract $arrivalAirport
      arrivalID: '$arrivalAirport._id',
      arrivalName: '$arrivalAirport.name',
      arrivalCoordinates: '$arrivalAirport.loc.coordinates',
      arrivalCity: '$arrivalAirport.city',
      arrivalStateID: '$arrivalAirport.state',
      arrivalStateName: '$arrivalAirport.stateName',
      arrivalCountry: '$arrivalAirport.countryName',
      arrivalGlobalRegion: '$arrivalAirport.globalRegion',
      arrivalWAC: '$arrivalAirport.WAC',
      arrivalNotes: '$arrivalAirport.notes',
    },
  },
  // remove non-essential fields
  {
    $project: {
      calculatedDates: 0,
      departureAirport: 0,
      arrivalAirport: 0,
      flightNumber: 0,
      carrier: 0,
    },
  },
]);
