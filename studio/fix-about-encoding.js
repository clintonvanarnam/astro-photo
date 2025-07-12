// fix-about-encoding.js
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'xifjd4yh', // your project ID
  dataset: 'production', // your dataset (default is usually 'production')
  token: 'skRZB9wxqic8RsDmneWT7DdNn6f6wm7jNYaImJjNCnF09qDC7EqT6WV0tYKBdzYsR1t7xKGB22ItJxVvvUrccBbGgvz0eH9WWufh0uDCAs9brIT8ipLKpzy5luYS1POtVt6E6HWTLOymBfXKWVK2gfYv37yezZyGuHdFIBPKnMvpQbfhKfEG', // <-- your write-enabled token
  useCdn: false,
  apiVersion: '2023-01-01',
});

function fixEncoding(str) {
  if (!str) return str;
  return str
    .replace(/â€™/g, '’')
    .replace(/â€œ/g, '“')
    .replace(/â€�/g, '”')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€¦/g, '…')
    .replace(/â€˜/g, '‘')
    .replace(/â€/g, '—')
    .replace(/Ã©/g, 'é')
    .replace(/Ã/g, 'à');
}

async function run() {
  const aboutDocs = await client.fetch('*[_type == "about"]{_id, content}');
  for (const doc of aboutDocs) {
    let changed = false;
    if (Array.isArray(doc.content)) {
      // For blockContent, fix text in each block
      doc.content = doc.content.map(block => {
        if (block._type === 'block' && Array.isArray(block.children)) {
          block.children = block.children.map(child => {
            if (child._type === 'span' && typeof child.text === 'string') {
              const fixed = fixEncoding(child.text);
              if (fixed !== child.text) changed = true;
              return { ...child, text: fixed };
            }
            return child;
          });
        }
        return block;
      });
    }
    if (changed) {
      await client
        .patch(doc._id)
        .set({ content: doc.content })
        .commit();
      console.log(`Fixed encoding in document: ${doc._id}`);
    } else {
      console.log(`No changes needed for: ${doc._id}`);
    }
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
