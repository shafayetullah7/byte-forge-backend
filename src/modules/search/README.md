# Search module (BL-11 / BL-12)

Cross-catalog discovery for public navbar typeahead.

## Endpoint

- `GET /api/v1/search/suggest?q=&limit=`
- Public, no auth.
- Merges **plant products** (`productType: plant`, ACTIVE) and **ACTIVE entitled nurseries** into one ranked list (max 20).

## Visibility

Plant and shop SQL filters mirror `ListPublicPlantsQuery` and `ListPublicShopsQuery`. If list APIs change search/entitlement rules, update `search-suggest.query.ts` accordingly.

## Ranking (v1)

Prefix match on name/slug beats contains; ties broken alphabetically by name. Popularity/review signals can be added later (BL-06/07).
