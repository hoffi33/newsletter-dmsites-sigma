import axios from 'axios'
import * as cheerio from 'cheerio'

export async function scrapeBlogPost(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const $ = cheerio.load(response.data)

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .advertisement, .ad, .social-share').remove()

    // Try to find the main content
    let content = ''
    const selectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
    ]

    for (const selector of selectors) {
      const element = $(selector)
      if (element.length && element.text().trim().length > 200) {
        content = element.text().trim()
        break
      }
    }

    if (!content) {
      content = $('body').text().trim()
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').trim()

    // Try to get title
    let title = $('h1').first().text().trim()
    if (!title) {
      title = $('title').text().trim()
    }

    return {
      title,
      content,
      url,
    }
  } catch (error) {
    throw new Error(`Failed to scrape blog post: ${error}`)
  }
}

export async function scrapeWebContent(url: string) {
  return scrapeBlogPost(url)
}
