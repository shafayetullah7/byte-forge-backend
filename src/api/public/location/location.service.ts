import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { eq } from 'drizzle-orm';
import { resolveTranslation } from '@/common/utils/resolve-translation.util';
import {
  divisionsTable,
  districtsTable,
} from '@/_db/drizzle/schema/location';

export interface DistrictResponse {
  id: string;
  code: string;
  name: string;
}

export interface DivisionResponse {
  id: string;
  code: string;
  name: string;
  districts: DistrictResponse[];
}

@Injectable()
export class PublicLocationService {
  constructor(private readonly db: DrizzleService) {}

  async findAllDivisions(lang: string = 'en'): Promise<DivisionResponse[]> {
    const divisions = await this.db.client.query.divisionsTable.findMany({
      with: {
        translations: true,
        districts: {
          with: {
            translations: true,
          },
          orderBy: (t, { asc }) => asc(t.sortOrder),
        },
      },
      orderBy: (t, { asc }) => asc(t.sortOrder),
    });

    return divisions.map((division) => {
      const divisionTranslation = resolveTranslation(division.translations, lang);

      return {
        id: division.id,
        code: division.code,
        name: divisionTranslation?.name ?? 'Unnamed Division',
        districts: division.districts.map((district) => {
          const districtTranslation = resolveTranslation(district.translations, lang);

          return {
            id: district.id,
            code: district.code,
            name: districtTranslation?.name ?? 'Unnamed District',
          };
        }),
      };
    });
  }

  async findDivisionById(id: string, lang: string = 'en'): Promise<DivisionResponse | null> {
    const division = await this.db.client.query.divisionsTable.findFirst({
      where: eq(divisionsTable.id, id),
      with: {
        translations: true,
        districts: {
          with: {
            translations: true,
          },
          orderBy: (t, { asc }) => asc(t.sortOrder),
        },
      },
    });

    if (!division) return null;

    const divisionTranslation = resolveTranslation(division.translations, lang);

    return {
      id: division.id,
      code: division.code,
      name: divisionTranslation?.name ?? 'Unnamed Division',
      districts: division.districts.map((district) => {
        const districtTranslation = resolveTranslation(district.translations, lang);

        return {
          id: district.id,
          code: district.code,
          name: districtTranslation?.name ?? 'Unnamed District',
        };
      }),
    };
  }

  async findAllDistricts(lang: string = 'en'): Promise<DistrictResponse[]> {
    const districts = await this.db.client.query.districtsTable.findMany({
      with: {
        translations: true,
      },
      orderBy: (t, { asc }) => asc(t.sortOrder),
    });

    return districts.map((district) => {
      const districtTranslation = resolveTranslation(district.translations, lang);

      return {
        id: district.id,
        code: district.code,
        name: districtTranslation?.name ?? 'Unnamed District',
      };
    });
  }

  async findDistrictById(id: string, lang: string = 'en'): Promise<DistrictResponse | null> {
    const district = await this.db.client.query.districtsTable.findFirst({
      where: eq(districtsTable.id, id),
      with: {
        translations: true,
      },
    });

    if (!district) return null;

    const districtTranslation = resolveTranslation(district.translations, lang);

    return {
      id: district.id,
      code: district.code,
      name: districtTranslation?.name ?? 'Unnamed District',
    };
  }
}
