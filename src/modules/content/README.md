# Content module

Shop articles and campaigns (seller CRUD, admin moderation, public shop lists).

## HTTP

| Audience | Routes | Controller |
|----------|--------|------------|
| Seller | `v1/user/seller/articles`, `v1/user/seller/campaigns` | `SellerArticlesController`, `SellerCampaignsController` |
| Admin | `v1/admin/articles`, `v1/admin/campaigns` | `AdminArticlesController`, `AdminCampaignsController` |
| Public shop | `v1/shops/:slug/articles`, `v1/shops/:slug/campaigns` | `PublicShopArticlesController`, `PublicShopCampaignsController` |
| Public feed | `GET v1/campaigns/feed` | `PublicCampaignsFeedController` |

### Campaign feed (`GET /api/v1/campaigns/feed`)

Cross-shop offers for home and `/offers` (BL-01). Returns paginated items:

- `shopSlug`, `shopName`, `campaign` (public campaign DTO incl. `slug`)

**Filters:** moderation `APPROVED`, campaign window active (`startDate <= now <= endDate`), shop `ACTIVE`, seller subscription entitlement. Sorted by `endDate` ascending.

**v1:** does not filter campaign products by stock; approved + in-window only.

## Cross-module access

| Consumer | API |
|----------|-----|
| Seller analytics | `ContentQueryService.countApprovedArticlesByShopId`, `countApprovedCampaignsByShopId` |

## Module graph

`ContentModule` → `ShopModule` (one-way). Exports `ContentQueryService` only.
