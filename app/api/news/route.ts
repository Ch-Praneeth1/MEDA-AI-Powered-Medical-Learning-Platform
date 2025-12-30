import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const newsApiUrl = process.env.NEWS_API_URL;

    if (!newsApiUrl) {
      return NextResponse.json(
        { error: 'NEWS_API_URL is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(newsApiUrl, {
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news feed');
    }

    const xmlText = await response.text();

    // Parse XML to extract news items
    const items = parseRSSFeed(xmlText);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
}

function parseRSSFeed(xmlText: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemContent) || 
                       /<title>(.*?)<\/title>/.exec(itemContent);
    const title = titleMatch ? titleMatch[1] : '';

    // Extract link
    const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
    const link = linkMatch ? linkMatch[1] : '';

    // Extract pubDate
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent);
    const pubDate = pubDateMatch ? pubDateMatch[1] : '';

    // Extract source
    const sourceMatch = /<source url=".*?">(.*?)<\/source>/.exec(itemContent);
    const source = sourceMatch ? sourceMatch[1] : 'Unknown Source';

    // Extract description (contains HTML, we'll clean it)
    const descriptionMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(itemContent) ||
                            /<description>(.*?)<\/description>/.exec(itemContent);
    let description = descriptionMatch ? descriptionMatch[1] : '';
    
    // Clean description - remove HTML tags and extract text
    description = description
      .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
      .replace(/<font[^>]*>(.*?)<\/font>/g, '$1')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (title && link) {
      items.push({
        title,
        link,
        pubDate,
        source,
        description: description || title
      });
    }
  }

  return items;
}
