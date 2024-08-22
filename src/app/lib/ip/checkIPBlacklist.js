export async function checkBlackliste() {
    try {
      const response = await fetch(`https://toopnin.com/api/orders/ip`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error('Failed to fetch IP check:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }