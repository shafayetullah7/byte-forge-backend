import { TMedia, TShop, TShopTranslation } from '@/_db/drizzle/schema';
import { TShopContact } from '@/_db/drizzle/schema/shop/shop.contact.schema';
import { TShopAddress } from '@/_db/drizzle/schema/shop/shop.address.schema';
import { TShopAddressTranslation } from '@/_db/drizzle/schema/shop/shop.address.translation.schema';

/**
 * Shop with branding relations - matches the return type of getShopByOwnerBranding
 */
export type TShopWithBranding = TShop & {
  translations: TShopTranslation[];
  logo: TMedia | null;
  banner: TMedia | null;
};

/**
 * Shop with all relations (branding + contact + address)
 */
export type TShopWithRelations = TShop & {
  translations: TShopTranslation[];
  logo: TMedia | null;
  banner: TMedia | null;
  contact: TShopContact | null;
  address: (TShopAddress & { translations: TShopAddressTranslation[] }) | null;
};

/**
 * Media information for verification documents
 */
export type VerificationMedia = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
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
  tradeLicenseDocumentId: string | null;
  tinDocumentId: string | null;
  utilityBillDocumentId: string | null;
  tradeLicenseDocument: VerificationMedia | null;
  tinDocument: VerificationMedia | null;
  utilityBillDocument: VerificationMedia | null;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Shop contact information (includes social media)
 */
export type ShopContactDetails = {
  businessEmail: string | null;
  phone: string | null;
  alternativePhone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
};

/**
 * Shop address translation
 */
export type ShopAddressTranslation = {
  locale: string;
  country: string;
  division: string;
  district: string;
  street: string;
};

/**
 * Shop address with location
 */
export type ShopAddressDetails = {
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  googleMapsLink: string | null;
  isVerified: boolean;
  translations: ShopAddressTranslation[];
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
  contact: ShopContactDetails | null;
  address: ShopAddressDetails | null;
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
  rejectionReason: string | null;
};
