import { Controller } from '@nestjs/common';
import { TreeCategoriesService } from './tree-categories.service';

@Controller({ path: 'tree-categories', version: '1' })
export class TreeCategoriesController {
  constructor(private readonly treeCategoriesService: TreeCategoriesService) {}
}
