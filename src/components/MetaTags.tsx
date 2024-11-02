import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

function MetaTags({ title, description, image, url }: MetaTagsProps) {
  const domain = 'https://matkoneta.replit.app';
  const defaultImage = `${domain}/chef-logo.png`;
  const defaultUrl = window.location.href;

  // וודא שה-URL של התמונה הוא מלא ומוחלט
  const fullImageUrl = image 
    ? (image.startsWith('http') ? image : `${domain}${image}`) 
    : defaultImage;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" type="image/png" href="/chef-logo.png" />

      {/* Open Graph / Facebook & WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:secure_url" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={title} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url || defaultUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
    </Helmet>
  );
}

export default MetaTags; 