import { TMedia, TShop, TShopTranslation } from '@/_db/drizzle/schema';
import { TShopVerification } from '@/_db/drizzle/schema/shop';

/**
 * Shop with branding relations - matches the return type of getShopByOwnerBranding
 */
export type TShopWithBranding = TShop & {
  translations: TShopTranslation[];
  logo: TMedia | null;
  banner: TMedia | null;
};

/**
 * Verification status returned to users
 * Excludes sensitive admin notes
 */
export type VerificationStatus = {
  id: string;
  shopId: string;
  status: string;
  tradeLicenseNumber: string | null;
  tinNumber: string | null;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Simplified localized shop details - includes only shop info with translations, logo, and banner
 * Used for public shop display and basic shop information
 */
export type LocalizedShopDetails = {
  id: string;
  ownerId: string;
  slug: string;
  logoId: string | null;
  bannerId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string | null;
  businessHours: string | null;
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
    name: string;
    description: string | null;
    businessHours: string | null;
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
