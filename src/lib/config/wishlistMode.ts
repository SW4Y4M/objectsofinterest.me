export type WishlistMode = "live" | "mock";

export function getWishlistMode(): WishlistMode {
  return process.env.WISHLIST_MODE === "mock" ? "mock" : "live";
}
