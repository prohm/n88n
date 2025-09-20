// Get the HTML content AND the page info from the single input item.
const input_item = items[0].json;
const html_content = input_item.html;
const pageNumber = input_item.pageNumber;
const totalPages = input_item.totalPages;

const parsed_posts = [];

const articleRegex = /<article id=["']?p(\d+)["']?.*?class=["']?post.*?thread_post["']?.*?>(.*?)<\/article>/gs;

let articleMatch;
while ((articleMatch = articleRegex.exec(html_content)) !== null) {
  const post_id = articleMatch[1];
  const article_html = articleMatch[2];

  const post_data = {
    post_id: post_id || 'N/A',
    pageNumber: pageNumber,
    totalPages: totalPages,
  };

  // --- Extract Post Number (e.g., #1, #2) ---
  const postNumberRegex = /<a.*?class=["']?dateline_permalink["']?.*?>#(\d+)<\/a>/;
  const postNumberMatch = article_html.match(postNumberRegex);
  post_data.post_number = postNumberMatch ? postNumberMatch[1] : 'N/A';

  // --- Extract Author Information ---
  const authorRegex = /<a href="([^"]+)" class=["']?postauthor["']?.*?>([^<]+)<\/a>/;
  const authorMatch = article_html.match(authorRegex);
  if (authorMatch) {
    const base_url = "https://";
    post_data.author_profile_url = base_url + authorMatch[1].replace(/&amp;/g, '&');
    post_data.author_name = authorMatch[2].trim();
  } else {
    post_data.author_profile_url = 'N/A';
    post_data.author_name = 'N/A';
  }

  // --- Extract Timestamp ---
  const timestampRegex = /<span class=["']?dateline_timestamp["']?>([^<]+)<\/span>/;
  const timestampMatch = article_html.match(timestampRegex);
  post_data.timestamp = timestampMatch ? timestampMatch[1].trim() : 'N/A';

  // --- Extract Post Content (CRITICAL FIX HERE) ---
  // We now capture the entire post_body section to include quotes and replies.
  const contentRegex = /<section class=["']?post_body["']?>(.*?)<\/section>/s;
  const contentMatch = article_html.match(contentRegex);
  if (contentMatch && contentMatch[1]) {
    let content = contentMatch[1];
    // Clean up the HTML for better spreadsheet readability
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<[^>]*>/g, '');
    content = content.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    post_data.content = content.trim();
  } else {
    post_data.content = '';
  }

  parsed_posts.push(post_data);
}

return parsed_posts.map(post => ({ json: post }));
