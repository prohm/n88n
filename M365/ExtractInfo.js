下面这段代码是什么用途：

const cheerio = require("cheerio");


const htmlContent = items[0].json.body.content;


if (!htmlContent) {
  throw new Error("No HTML content found in the input");
}


const $ = cheerio.load(htmlContent, { xmlMode: true });


const incidentAnchor = $('a[href*="servicehealth?message="]').first();
const incidentLink = incidentAnchor.attr('href') || null;


$('script, style, head, nav, footer, iframe, img').remove();


let plainText = '';


const mainContent = $('body') || $('main') || $('div.main-content');


mainContent.find('h1, h2, h3, h4, h5, p, li, table, div').each((i, el) => {
  const tag = $(el).prop('tagName').toLowerCase();
  const text = $(el).text().trim();
  
  if (!text) return;
  
  // Add appropriate spacing and formatting
  if (tag.startsWith('h')) {
    plainText += `\n\n${text}\n\n`;
  } else if (tag === 'p') {
    plainText += `\n${text}\n`;
  } else if (tag === 'li') {
    plainText += `\n- ${text}`;
  } else {
    plainText += `\n${text}`;
  }
});


plainText = plainText.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();


return [{
  json: {
    extractedText: plainText,
    incidentLink: incidentLink
  }
}];
