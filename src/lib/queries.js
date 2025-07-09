export const photosQuery = `*[_type == "post"]{
  _id,
  title,
  mainImage{
    asset->{
      url
    }
  }
}`;