import { createClient } from '@sanity/client';
export const client = createClient({
  projectId: 'xifjd4yh', 
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-07-09',
});