export async function checkBlackliste(ip) {
    try {
      const response = await fetch(`https://localhost:3000/api/orders/ip?ip=${ip}`);
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