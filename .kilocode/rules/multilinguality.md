# Multilinguality Rules

This document defines the multilingual support requirements for the application. The platform primarily serves a Bengali-speaking audience while maintaining English support for broader reach.

## Core Requirements

- **Dual Language Mandate**: All user-generated content (shops, products, plants, etc.) must be provided in both English and Bengali by sellers and administrators
- **Equal Priority**: English and Bengali must receive equal first-class support throughout the application
- **Mandatory Input**: Content creators (sellers and admins) are required to provide translations for both languages when creating/updating content
- **Fallback Strategy**: When translations are unavailable, the system should gracefully fallback to the primary language (English) while indicating the language preference

## Implementation Patterns

- **Current Standard (Recommended)**: From now on, all new multilingual implementations should use the **English-as-Default Pattern** where English is stored in the main table and other languages (like Bengali) are stored in separate translation tables. This approach will continue until it's no longer feasible.
- **Pattern Selection Criteria**: Choose the appropriate pattern based on content characteristics:
  - Use **English-as-Default Pattern** (preferred) when English is considered the primary/default language and translations are supplementary
  - Use **Separate Records Pattern** only when absolutely necessary (e.g., when all languages truly have equal importance and no single language is primary)
- **English-as-Default Pattern**: For content tables, English values should be stored in the main table as required fields, with translation tables storing alternate language versions (like Bengali)
- **Separate Records Pattern**: When using this pattern, each language version gets its own record with a locale field; English should NOT be treated specially and should be stored alongside other languages in the same table
- **Translation Tables**: Separate translation tables should be used for non-English content with proper foreign key relationships
- **Validation Enforcement**: Backend validation must ensure both English and Bengali translations are provided before content is saved
- **DTO Requirements**: Data Transfer Objects must include fields for both English and Bengali content to enforce dual-language input

## Supported Languages

- **Primary Languages**: English ('en') and Bengali ('bn') are the only supported languages
- **Future Expansion**: Additional languages may be added in future phases but must follow the same dual-language enforcement pattern initially

## Content Areas Requiring Translation

- Shop information (name, about, brand story, highlights)
- Product/Plant details (names, descriptions, care instructions)
- Address information (countries, divisions, districts, streets)
- Category and tag names
- User-facing messages (success, error, warning messages)
- SEO content (meta titles, descriptions)

## Error and Success Messages

- **Bilingual Messages**: All system messages (errors, successes, warnings) must be available in both English and Bengali
- **Localization**: Messages should be properly localized for cultural appropriateness in both languages
- **Consistent Tone**: Maintain consistent tone and meaning across both language versions

## UI and Display Considerations

- **RTL Support**: Proper Right-to-Left layout support for Bengali content where applicable
- **Character Encoding**: Ensure proper Unicode support for Bengali script characters
- **Font Support**: Use fonts that properly render Bengali characters
- **Text Expansion**: Account for text expansion/contraction differences between English and Bengali

## Validation and Quality Assurance

- **Input Validation**: Both language fields must be validated for minimum/maximum lengths and content requirements
- **Content Moderation**: Translation quality should be monitored to ensure accurate and culturally appropriate content
- **Testing**: Automated tests should verify both language versions display correctly

## API and Data Handling

- **Language Detection**: APIs should detect and respect user language preferences
- **Response Formatting**: API responses should include appropriate language-specific content based on request headers or parameters
- **Database Storage**: Translation tables must maintain referential integrity and proper indexing for performance

## Administrative Controls

- **Admin Enforcement**: Administrators must ensure all platform content meets bilingual requirements
- **Content Review**: Admin interfaces should facilitate review of both language versions of content
- **Moderation Tools**: Provide tools for moderating content in both languages effectively
