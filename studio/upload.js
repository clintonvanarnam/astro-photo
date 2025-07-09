import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: 'xifjd4yh',     
  dataset: 'production',
  useCdn: false,
  token: 'skRZB9wxqic8RsDmneWT7DdNn6f6wm7jNYaImJjNCnF09qDC7EqT6WV0tYKBdzYsR1t7xKGB22ItJxVvvUrccBbGgvz0eH9WWufh0uDCAs9brIT8ipLKpzy5luYS1POtVt6E6HWTLOymBfXKWVK2gfYv37yezZyGuHdFIBPKnMvpQbfhKfEG', 
  apiVersion: '2023-07-09',
});

const IMAGES_DIR = path.resolve(`${process.env.HOME}/Desktop/1`);

const uploadImages = async () => {
  const files = fs.readdirSync(IMAGES_DIR).filter(file => file.endsWith('.png'));

  for (let file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const imageAsset = await client.assets.upload('image', fs.createReadStream(filePath), {
      filename: file,
    });

    const doc = {
      _type: 'post',
      title: file.replace(/\.[^/.]+$/, ''), // filename without extension
      mainImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
    };

    const result = await client.create(doc);
    console.log(`✅ Uploaded: ${file} → ${result._id}`);
  }
};

uploadImages().catch(console.error);