'use server'
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Replace with your Google Analytics 4 property ID
const propertyId = '454869603';

// Initialize the Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient();

export async function realTimeActiveUsersReport() {
  // Run the report
  const [response] = await analyticsDataClient.runRealtimeReport({
    property: `properties/${propertyId}`,
    dimensions: [
      {
        name: 'unifiedScreenName',
      },
      {
        name: 'minutesAgo',
      },
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'minutesAgo',
        stringFilter: {
          matchType: 'EXACT',
          value: '00', // Only include users active in the current minute
        },
      },
    },
  });


  let data = []
  response.rows.forEach(row => {
    data.push({ pagePath: row.dimensionValues[0].value, activeUsers: row.metricValues[0].value })
  })
  return data
}

export async function ActiveUsersReport(time) {

  const { startDate, endDate } = getDateRange(time);
  console.log(startDate, endDate)

  // Run the report
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: startDate,
        endDate: endDate,
      },
    ],
    dimensions: [
      {
        name: 'pagePath',
      },
    ],
    metrics: [
      {
        name: 'activeUsers',
      },
    ],
  });


  let data = []
  response.rows.forEach(row => {
    data.push({ pagePath: row.dimensionValues[0].value, activeUsers: row.metricValues[0].value })
  })
  return data
}

function getDateRange(time) {
  const today = new Date();
  let startDate;
  let endDate = 'today'; // Default to today

  switch (time) {
    case 'today':
      startDate = 'today';
      endDate = 'today';
      break;
    case 'this week':
      // Get the current day of the week (0-6, with Sunday as 0)
      const dayOfWeek = today.getDay();
      // Calculate the start of the week (Sunday)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      startDate = formatDate(weekStart);
      break;
    case 'this month':
      // Get the start of the current month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatDate(monthStart);
      break;
    case 'maximum':
      startDate = '2024-1-1'; // Arbitrary date far enough in the past
      break;
    default:
      throw new Error('Invalid time parameter');
  }

  return { startDate, endDate };
}

// Utility function to format date as 'YYYY-MM-DD'
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}



