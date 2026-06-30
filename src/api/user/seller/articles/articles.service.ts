import { Injectable } from '@nestjs/common';
import {
  ListArticlesService,
  GetArticleService,
} from './services/article-queries.service';
import {
  ArchiveArticleService,
  CreateArticleService,
  DeleteArticleService,
  SubmitArticleService,
  UpdateArticleService,
} from './services/article-mutations.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly listArticlesService: ListArticlesService,
    private readonly getArticleService: GetArticleService,
    private readonly createArticleService: CreateArticleService,
    private readonly updateArticleService: UpdateArticleService,
    private readonly submitArticleService: SubmitArticleService,
    private readonly archiveArticleService: ArchiveArticleService,
    private readonly deleteArticleService: DeleteArticleService,
  ) {}

  list(shopId: string, query: ListArticlesQueryDto) {
    return this.listArticlesService.execute(shopId, query);
  }

  get(shopId: string, articleId: string) {
    return this.getArticleService.execute(shopId, articleId);
  }

  create(shopId: string, dto: CreateArticleDto) {
    return this.createArticleService.execute(shopId, dto);
  }

  update(shopId: string, articleId: string, dto: UpdateArticleDto) {
    return this.updateArticleService.execute(shopId, articleId, dto);
  }

  submit(shopId: string, articleId: string, shopStatus: string) {
    return this.submitArticleService.execute(shopId, articleId, shopStatus);
  }

  archive(shopId: string, articleId: string) {
    return this.archiveArticleService.execute(shopId, articleId);
  }

  delete(shopId: string, articleId: string) {
    return this.deleteArticleService.execute(shopId, articleId);
  }
}
