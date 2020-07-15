import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { isArray, forEach, map } from 'lodash';
import { ProductsService } from '../../../core/services/products.service';
import { CustomersService } from '../../../core/services/customers.service';
import { OrdersService } from '../../../core/services/orders.service';
import { Product } from '../../../core/classes/product';
import { Customer } from '../../../core/classes/customer';
import { Order } from '../../../core/classes/order';
import { OrderDetail } from '../../../core/classes/order-detail';
import { StatsService } from '../../../core/services/stats.service';
import { UtilsService } from '../../../shared/services/utils.service';

declare var jQuery: any;
@Component({
  selector: 'storaji-orders-add',
  templateUrl: './add.component.html',
  styles: []
})
export class AddComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  private _sub: Subscription = undefined;
  private _addSub: Subscription = undefined;
  private _customerSub: Subscription = undefined;

  @Output('update')
  update: EventEmitter<Order[]> = new EventEmitter<Order[]>();

  products: Product[] = [];
  customers: Customer[] = [];
  orders: Order[] = [];

  constructor(
    private _productsService: ProductsService,
    private _customersService: CustomersService,
    private _ordersService: OrdersService,
    private _statsService: StatsService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this.init();
  }

  ngAfterViewInit() {
    jQuery('input[uk-datepicker]').datepicker({ format: 'yyyy-mm-dd', autoPick:true });
  }

  ngAfterViewChecked() {
    jQuery('input[uk-datepicker]').datepicker({ format: 'yyyy-mm-dd', autoPick:true });
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
    this._utils.unsubscribeSub(this._customerSub);
    this._utils.unsubscribeSub(this._addSub);
  }

  async onSubmit() {
    this._utils.unsubscribeSub(this._addSub);
    map(jQuery('input[uk-datepicker]'), el => {
      const input = jQuery(el)[0];
      this.orders[input.name.slice().replace('sales_date-', '')].order_detail.sales_date = input.value;
      return el;
    });

    this._addSub = await this._ordersService.add(this.orders).subscribe(
      data => {
        if (isArray(data)) {
          this.update.emit(data);
          this.init();
        }
      }
    );
  }

  init() {
    this._utils.unsubscribeSub(this._sub);
    this._utils.unsubscribeSub(this._customerSub);
    this.orders = [new Order()];

    this._sub = this._productsService.get().subscribe(
      data => {
        forEach(data, (product: Product) => {
          if (product.stock > 0) {
            this.products.push(product);
          }
        });
      },
      err => { console.log(err); }
    );

    this._customerSub = this._customersService.get().subscribe(
      data => this.customers = data,
      err => { console.log(err); }
    );
  }

  onAdd() {
    this.orders.push(new Order());
  }

  available_stock(e: any, i: number) {
    if (e.target.value > this.orders[i].order_detail.product.stock) {
      return e.target.value = this.orders[i].order_detail.product.stock;
    }
  }

  update_actual_price(e: any, i: number) {
    if (e.target.value) {
      this.orders[i].order_detail.actual_price = (e.target.value * this.orders[i].order_detail.product.selling_price);
    }
  }

  update_discount(e: any, i: number) {
    if (e.target.value && this.orders[i].order_detail.actual_price) {
      var tempPercentCalculate = (e.target.value/this.orders[i].order_detail.actual_price)*100;
      var percentage = 100 - tempPercentCalculate;
      this.orders[i].order_detail.discount = (percentage);
    }
  }

}
