import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databases = [
  process.env.NOTION_DATABASE_1,
  process.env.NOTION_DATABASE_2,
  process.env.NOTION_DATABASE_3
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, filters } = req.body;
    let allResults = [];
    let totalResults = 0;

    // Query each database
    for (const dbId of databases) {
      if (!dbId) continue;
      
      try {
        // Get database pages
        const dbResponse = await notion.databases.query({
          database_id: dbId,
          page_size: 50
        });

        // Get content of each page
        for (const page of dbResponse.results.slice(0, 10)) {
          try {
            const pageContent = await notion.blocks.children.list({
              block_id: page.id,
            });

            const content = pageContent.results
              .filter(block => block.type === 'paragraph' && block.paragraph.rich_text.length > 0)
              .map(block => block.paragraph.rich_text.map(text => text.plain_text).join(''))
              .join(' ');

            allResults.push({
              id: page.id,
              title: getPageTitle(page),
              content: content,
              properties: page.properties,
              database: dbId
            });
          } catch (pageError) {
            console.error('Error fetching page content:', pageError);
          }
        }

        totalResults += dbResponse.results.length;
      } catch (dbError) {
        console.error('Error querying database:', dbError);
      }
    }

    // Extract insights and best practices
    const insights = allResults
      .map(result => result.content)
      .filter(content => content && content.length > 50)
      .slice(0, 10);

    const bestPractices = allResults
      .filter(result => result.title && (
        result.title.toLowerCase().includes('best') ||
        result.title.toLowerCase().includes('practice') ||
        result.title.toLowerCase().includes('metodologia') ||
        result.title.toLowerCase().includes('framework')
      ))
      .map(result => result.title)
      .slice(0, 5);

    res.status(200).json({
      totalResults,
      results: allResults.slice(0, 20),
      insights,
      bestPractices,
      methodology: "Metodologia proprietaria di assessment dell'innovazione presente nei database Notion"
    });

  } catch (error) {
    console.error('Notion API Error:', error);
    res.status(500).json({ 
      error: 'Failed to query Notion databases',
      details: error.message 
    });
  }
}

function getPageTitle(page) {
  const titleProperty = Object.values(page.properties).find(
    prop => prop.type === 'title'
  );
  
  if (titleProperty && titleProperty.title.length > 0) {
    return titleProperty.title.map(text => text.plain_text).join('');
  }
  
  return 'Untitled';
}
