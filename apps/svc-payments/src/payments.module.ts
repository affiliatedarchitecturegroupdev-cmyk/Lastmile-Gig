import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeModule } from './stripe/stripe.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [StripeModule, WalletModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}