import { createClient } from '@sanity/client';
export const client = createClient({
  projectId: 'xifjd4yh', 
  dataset: 'production',
  useCdn: false, // Set to false for development to bypass CDN cache
  apiVersion: '2023-07-09',
});