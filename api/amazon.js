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
    scope: "advertising::campaign_management",
  });

  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Token error: ${response.status} ${text}`);
  }

  return JSON.parse(text);
}
