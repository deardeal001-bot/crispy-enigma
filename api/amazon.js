const TOKEN_URL = "https://api.amazon.com/auth/o2/token";

async function getAccessToken() {
  const clientId = process.env.AMZ_CLIENT_ID;
  const clientSecret = process.env.AMZ_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Amazon credentials in environment variables");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token error: ${response.status} ${text}`);
  }

  return response.json();
}

async function callCreatorsApi(accessToken, payload) {
  const response = await fetch("https://api.amazon.com/creatorhub/partner/v1/searchItems", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Creators API error: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { keyword, asin, marketplace = "www.amazon.in" } = req.query;

    if (!keyword && !asin) {
      return res.status(400).json({
        error: "Provide ?keyword=... or ?asin=...",
      });
    }

    const tokenData = await getAccessToken();
    const accessToken = tokenData.access_token;

    const payload = {
      marketplace,
      keywords: keyword || asin,
      pageSize: 10,
    };

    const data = await callCreatorsApi(accessToken, payload);

    return res.status(200).json({
      ok: true,
      query: { keyword: keyword || null, asin: asin || null, marketplace },
      data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
