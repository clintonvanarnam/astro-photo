export const photosQuery = `*[_type == "post"]{
  _id,
  title,
  mainImage{
    asset->{
      url
    }
  }
}`;

export const aboutQuery = `*[_type == "about"][0]{
  title,
  content
}`;