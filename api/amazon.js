export default async function handler(req, res) {
  // Allow Blogger / browser to call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const { asin, keyword } = req.query;

  if (!asin && !keyword) {
    return res.status(400).json({
      error: "Please provide ?asin=... or ?keyword=...",
    });
  }

  // Later we will replace this with a real Amazon Creators API call
  return res.status(200).json({
    message: "API is working",
    asin: asin || null,
    keyword: keyword || null,
  });
}
