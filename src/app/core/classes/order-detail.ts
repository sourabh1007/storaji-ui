import { Product } from './product';

export class OrderDetail {
  order_id?: string;
  product_id?: string;
  amount: number = null;
  product: Product = new Product();
  actual_price: number = null;
  selling_price: number = null;
  discount: number = null;
  sales_date: Date;
}
