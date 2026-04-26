import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import {
  tagGroupsTable,
  tagGroupTranslationsTable,
  tagsTable,
  tagTranslationsTable,
} from '@/_db/drizzle/schema/taxonomy';
import { and, eq, isNull, inArray, sql } from 'drizzle-orm';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';

export interface PublicTagResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  usageCount: number;
  translations: Array<{
    locale: string;
    name: string;
    description: string | null;
  }>;
}

export interface PublicTagGroupResponse {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  tags: PublicTagResponse[];
}

@Injectable()
export class PublicTagsService {
  constructor(private readonly db: DrizzleService) {}

  async findAll(lang: string = 'en'): Promise<PublicTagGroupResponse[]> {
    const activeGroups = await this.db.client.query.tagGroupsTable.findMany({
      where: and(
        eq(tagGroupsTable.isActive, true),
        isNull(tagGroupsTable.deletedAt),
      ),
      with: {
        tags: {
          where: and(
            eq(tagsTable.isActive, true),
            isNull(tagsTable.deletedAt),
          ),
          with: {
            translations: true,
          },
        },
        translations: true,
      },
      orderBy: (t, { asc }) => asc(t.slug),
    });

    return activeGroups
      .filter((group) => group.tags.length > 0)
      .map((group) => {
        const groupTranslation = resolveTranslation(group.translations, lang);

        return {
          id: group.id,
          slug: group.slug,
          name: groupTranslation?.name ?? 'Unnamed Group',
          description: groupTranslation?.description ?? null,
          tags: group.tags.map((tag) => {
            const tagTranslation = resolveTranslation(tag.translations, lang);

            return {
              id: tag.id,
              slug: tag.slug,
              name: tagTranslation?.name ?? 'Unnamed Tag',
              description: tagTranslation?.description ?? null,
              usageCount: tag.usageCount,
              translations: tag.translations.map((t) => ({
                locale: t.locale,
                name: t.name,
                description: t.description ?? null,
              })),
            };
          }),
        };
      });
  }

  async findOne(id: string, lang: string = 'en'): Promise<PublicTagResponse> {
    const tag = await this.db.client.query.tagsTable.findFirst({
      where: and(
        eq(tagsTable.id, id),
        isNull(tagsTable.deletedAt),
      ),
      with: {
        translations: true,
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag ${id} not found.`);
    }

    const translation = resolveTranslation(tag.translations, lang);

    return {
      id: tag.id,
      slug: tag.slug,
      name: translation?.name ?? 'Unnamed Tag',
      description: translation?.description ?? null,
      usageCount: tag.usageCount,
      translations: tag.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        description: t.description ?? null,
      })),
    };
  }
}
