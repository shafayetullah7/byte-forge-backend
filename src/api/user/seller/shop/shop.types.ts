import { TMedia, TShop, TShopTranslation } from '@/_db/drizzle/schema';

/**
 * Shop with branding relations - matches the return type of getShopByOwnerBranding
 */
export type TShopWithBranding = TShop & {
  translations: TShopTranslation[];
  logo: TMedia | null;
  banner: TMedia | null;
};

/**
 * Simplified localized shop details - includes only shop info with translations, logo, and banner
 * Used for public shop display and basic shop information
 */
export type LocalizedShopDetails = {
  id: string;
  ownerId: string;
  slug: string;
  address: string | null;
  logoId: string | null;
  bannerId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  shopName: string;
  about: string | null;
  brandStory: string | null;
  featuredHighlight: string | null;
  logo: {
    id: string;
    url: string;
    mimeType: string;
    fileName: string;
    size: number;
  } | null;
  banner: {
    id: string;
    url: string;
    mimeType: string;
    fileName: string;
    size: number;
  } | null;
  translations: Array<{
    id: string;
    shopId: string;
    locale: string;
    shopName: string;
    about: string | null;
    brandStory: string | null;
    featuredHighlight: string | null;
  }>;
};

/**
 * Minimal shop status type - used to check if user has a shop setup
 * Returns only essential fields needed for routing decisions
 */
export type ShopStatus = {
  id: string;
  slug: string;
  status: string;
  hasTranslations: boolean;
};
