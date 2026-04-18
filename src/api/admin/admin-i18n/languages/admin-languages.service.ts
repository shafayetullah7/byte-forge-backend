import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { DrizzleService } from '@/_db/drizzle/drizzle.service';
import { languagesTable } from '@/_db/drizzle/schema/i18n/language.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminLanguagesService {
  constructor(private readonly db: DrizzleService) {}

  async findAll() {
    return this.db.client.query.languagesTable.findMany({
      orderBy: (languages, { asc }) => [asc(languages.name)],
    });
  }

  async create(dto: CreateLanguageDto) {
    // Check if code already exists
    const existing = await this.db.client.query.languagesTable.findFirst({
      where: eq(languagesTable.code, dto.code),
    });

    if (existing)
      throw new BadRequestException(
        `Language code '${dto.code}' already exists`,
      );

    const [lang] = await this.db.client
      .insert(languagesTable)
      .values(dto)
      .returning();

    return lang;
  }

  async update(code: string, dto: UpdateLanguageDto) {
    const existing = await this.db.client.query.languagesTable.findFirst({
      where: eq(languagesTable.code, code),
    });

    if (!existing)
      throw new NotFoundException(`Language code '${code}' not found`);

    const [updated] = await this.db.client
      .update(languagesTable)
      .set(dto)
      .where(eq(languagesTable.code, code))
      .returning();

    return updated;
  }
}
