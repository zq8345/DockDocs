# DockDocs Google Search Console Setup

This note documents the safe Google Search Console setup path for `https://dockdocs.app`.

## Current SEO Access Files

- Sitemap URL: `https://dockdocs.app/sitemap.xml`
- Robots URL: `https://dockdocs.app/robots.txt`
- `robots.txt` should allow all crawlers and point to `https://dockdocs.app/sitemap.xml`.
- The sitemap should include the homepage, PDF tool pages, trust pages, blog pages, GEO hub pages, and localized `/en/` and `/zh/` pages.

## Verification Method

DockDocs supports Google Search Console HTML meta-tag verification through this environment variable:

```txt
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<paste-google-token-here>
```

When the value is present during the Netlify build, Next.js renders:

```html
<meta name="google-site-verification" content="<paste-google-token-here>" />
```

When the value is missing, DockDocs renders no verification meta tag. Do not add a fake token or fake verification file.

## Netlify Setup

1. Open the Netlify project for DockDocs.
2. Go to Site configuration, then Environment variables.
3. Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
4. Paste only the token value from the Google meta tag, not the full HTML tag.
5. Trigger a new production deploy.
6. Open the deployed homepage source and confirm the `google-site-verification` meta tag appears in the `<head>`.

## Google Search Console Steps

1. Open Google Search Console.
2. Add a URL-prefix property for `https://dockdocs.app/`.
3. Choose the HTML tag verification method.
4. Copy the `content` value from Google's meta tag.
5. Add that value to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Netlify.
6. Redeploy DockDocs.
7. Return to Search Console and click Verify.
8. Open Sitemaps in Search Console.
9. Submit `https://dockdocs.app/sitemap.xml`.
10. Use URL Inspection for key pages and request indexing where useful.

Google's own documentation notes that Search Console can verify ownership through a meta tag on the homepage, and that sitemap submission is managed from the Sitemaps report. Reference:

- https://support.google.com/webmasters/answer/9008080
- https://support.google.com/webmasters/answer/7451001
- https://support.google.com/webmasters/answer/12482179

## Indexing Checklist

- Verify the `https://dockdocs.app/` property.
- Submit `https://dockdocs.app/sitemap.xml`.
- Inspect `https://dockdocs.app/`.
- Inspect `https://dockdocs.app/compress-pdf/`.
- Inspect `https://dockdocs.app/jpg-to-pdf/`.
- Inspect `https://dockdocs.app/blog/`.
- Inspect `https://dockdocs.app/resources/`.
- Monitor indexing coverage, sitemap parsing, page discovery, and canonical status.
- Recheck after major content batches or route changes.

## Notes

- For a Domain property, use DNS verification instead of the HTML meta tag.
- For DockDocs URL-prefix verification, the meta tag method is safe and static-export compatible.
- Keep the verification token in Netlify environment variables rather than hardcoding it in the repository.
