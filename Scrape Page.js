
const randomDelay = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
const inputData = $input.first().json;
const currentPage = inputData.currentPage;


if (currentPage > 1) {
  await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
}

const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');


const proxyUrl = `socks5://${inputData.proxyUsername}:${inputData.proxyPassword}@${inputData.proxyHost}:${inputData.proxyPort}`;
const proxyAgent = new SocksProxyAgent(proxyUrl);

delete require.cache[require.resolve('axios')];


const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];


const pageUrl = currentPage === 1 ? inputData.baseUrl : `${inputData.baseUrl}/${currentPage}/`; 

console.log(`Page: ${currentPage},Delay: ${currentPage > 1 ? randomDelay : 0} `);
console.log(`Proxy: ${inputData.proxyHost}:${inputData.proxyPort}`);

let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  try {
    const response = await axios.get(pageUrl, {
      httpsAgent: proxyAgent,
      httpAgent: proxyAgent,
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      timeout: 30000
    });

    console.log(`Page ${currentPage} Status: ${response.status}`);
    

    return [{
      json: {
        pageNumber: currentPage,
        html: response.data,
        status: response.status,
        totalPages: inputData.totalPages

      }
    }];
    
  } catch (error) {
    retryCount++;

    console.error(`Page ${currentPage} failed (Retry ${retryCount}/${maxRetries}):`, error.toString());
    
    if (retryCount >= maxRetries) {

      return [{
        json: {
          pageNumber: currentPage,
          error: error.toString(),
          totalPages: inputData.totalPages
        }
      }];
    }
    

    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}
