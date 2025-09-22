const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');


const config = $('Initialize Config').first().json;


const productInfo = $input.item.json;

const proxyUrl = `socks5://${config.proxyUsername}:${config.proxyPassword}@${config.proxyHost}:${config.proxyPort}`;
const proxyAgent = new SocksProxyAgent(proxyUrl);
const baseUrl = config.stockurl
const productUrl = baseUrl + productInfo.sku; 

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];
const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

console.log(`Scrape SKU: ${productInfo.sku}`);


let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  try {
    const response = await axios.get(productUrl, {
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'EN-US,en;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      timeout: 15000, 
      responseTimeout: 10000, 
      connectionTimeout: 5000
    });
    
    return {
      json: {
        ...productInfo,
        scrapedData: response.data
      }
    };
    
  } catch (error) {
    retryCount++;
    console.error(`SKU ${productInfo.sku} failed (Retry ${retryCount}/${maxRetries}):`, error.toString());
    if (retryCount >= maxRetries) {
      return {
        json: {
          ...productInfo,
          error: error.toString()
        }
      };
    }
    //await new Promise(resolve => setTimeout(resolve, 5000));
    const retryDelays = [5000, 15000, 45000]; 
    await new Promise(resolve => setTimeout(resolve, retryDelays[retryCount - 1] || 60000));
  }
}
