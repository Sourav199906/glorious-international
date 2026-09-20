import { Helmet } from 'react-helmet-async';
export default function SEO({
  title = 'Glorious International | Travel, Hajj & Flights',
  description = 'Flights, Hajj and unforgettable tours with Glorious International',
  image,
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta name="robots" content="index,follow" />
    </Helmet>
  );
}
