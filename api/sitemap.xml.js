import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://studyspots.io";

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).send("Missing Supabase environment variables.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: places, error } = await supabase
    .from("places")
    .select("slug, updated_at, created_at")
    .eq("status", "approved")
    .not("slug", "is", null);

  if (error) {
    res.status(500).send(error.message);
    return;
  }

  const staticUrls = [
    {
      loc: `${SITE_URL}/`,
      priority: "1.0",
    },
    {
      loc: `${SITE_URL}/add-spot`,
      priority: "0.7",
    },
    {
      loc: `${SITE_URL}/login`,
      priority: "0.4",
    },
  ];

  const placeUrls = (places || []).map((place) => ({
    loc: `${SITE_URL}/places/${place.slug}`,
    lastmod: place.updated_at || place.created_at,
    priority: "0.8",
  }));

  const urls = [...staticUrls, ...placeUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>${
      url.lastmod
        ? `
    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>`
        : ""
    }
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).send(xml);
}