import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('q') q?: unknown) {
    let search: string | undefined;
    if (q !== undefined) {
      if (typeof q !== 'string' || q.length > 100) {
        throw new BadRequestException('Invalid search query');
      }
      search = q;
    }
    return this.productsService.findAll(search);
  }
}