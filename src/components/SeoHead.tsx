import { Helmet } from "react-helmet-async";

const SITE_URL = "https://jobdeck.app";

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

export function SeoHead({ title, description, path, noindex }: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {noindex && <meta name="robots" content="noindex" />}
    </Helmet>
  );
}
