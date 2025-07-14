export const photosQuery = `*[_type == "post"]{
  _id,
  title,
  mainImage{
    asset->{
      url
    }
  }
}`;

export const allPostIdsQuery = `*[_type == "post" && defined(slug.current)]{_id}`;
export const postsQuery = `*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`;
export const postsByIdsQuery = `*[_type == "post" && _id in $ids]`;
export const postQuery = `*[_type == "post" && slug.current == $slug][0]`;
export const aboutQuery = `*[_type == "about"][0]{content}`;