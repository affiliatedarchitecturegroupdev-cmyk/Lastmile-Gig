import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('order_items')
export class OrderItem {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn({ name: 'order_id' })
  orderId: string;

  @PrimaryColumn({ name: 'menu_item_id' })
  menuItemId: string;

  @Column({ name: 'partner_id' })
  partnerId: string;

  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ name: 'item_price', type: 'decimal', precision: 10, scale: 2 })
  itemPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'item_total', type: 'decimal', precision: 10, scale: 2 })
  itemTotal: number;

  @Column({ name: 'item_note', type: 'text', nullable: true })
  itemNote: string | null;

  @Column({ name: 'item_options', type: 'jsonb', nullable: true })
  itemOptions: Record<string, any> | null;
}