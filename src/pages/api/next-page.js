// This endpoint will be called by the client-side script to fetch the next page of posts.
// It receives a list of post IDs and returns the corresponding post data.
import { client } from '../../lib/sanityClient';
import { postsByIdsQuery } from '../../lib/queries';

export async function POST({ request }) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return new Response(JSON.stringify({ error: 'Invalid post IDs provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const posts = await client.fetch(postsByIdsQuery, { ids });
    
    // Re-order posts to match the shuffled ID order
    const postMap = new Map(posts.map(p => [p._id, p]));
    const orderedPosts = ids.map(id => postMap.get(id)).filter(Boolean);

    return new Response(JSON.stringify(orderedPosts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching next page:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
