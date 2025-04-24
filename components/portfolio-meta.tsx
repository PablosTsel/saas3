import Head from 'next/head';

interface PortfolioMetaProps {
  title: string;
  description?: string;
  name?: string;
  profilePictureUrl?: string;
  skills?: string[];
}

export default function PortfolioMeta({
  title,
  description,
  name,
  profilePictureUrl,
  skills = []
}: PortfolioMetaProps) {
  // Create a clean description from the provided text or generate one from skills
  const metaDescription = description
    ? description.substring(0, 160) // Keep meta description under 160 chars
    : `${name || 'Professional'}'s portfolio showcasing skills in ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ' and more' : ''}.`;

  // Use a default title format if title is not provided
  const pageTitle = title || (name ? `${name}'s Portfolio` : 'Professional Portfolio');

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      {profilePictureUrl && <meta property="og:image" content={profilePictureUrl} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={metaDescription} />
      {profilePictureUrl && <meta property="twitter:image" content={profilePictureUrl} />}

      {/* Additional Meta Tags */}
      {skills.length > 0 && (
        <meta name="keywords" content={skills.join(', ')} />
      )}
      <meta name="author" content={name || 'Portfolio Owner'} />
    </Head>
  );
} 