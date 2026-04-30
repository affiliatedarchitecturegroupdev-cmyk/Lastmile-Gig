import { Module } from '@nestjs/common';
import { OrderStateMachine } from './order-state-machine.service';
@Module({
  providers: [OrderStateMachine],
  exports: [OrderStateMachine],
})
export class OrderStateMachineModule {}