import { Module } from '@nestjs/common';
import { StorefrontsController } from './storefronts.controller';
import { StorefrontsService } from './storefronts.service';
import { MenuModule } from './menu/menu.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [MenuModule, CatalogModule],
  controllers: [StorefrontsController],
  providers: [StorefrontsService],
  exports: [StorefrontsService],
})
export class StorefrontsModule {}