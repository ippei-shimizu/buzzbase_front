export const RAILS_API_URL =
  process.env.RAILS_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://back:3000" : undefined);

if (!RAILS_API_URL) {
  throw new Error(
    "RAILS_API_URL environment variable is required in production",
  );
}
