import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { isArray } from 'lodash';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/classes/product';
import { UtilsService } from '../../shared/services/utils.service';

declare var numeral: any;

@Component({
  selector: 'storaji-products',
  templateUrl: './products.component.html',
  styles: []
})
export class ProductsComponent implements OnInit, OnDestroy {
  private _sub: Subscription = undefined;
  products: Product[];
  totalCostPrice: number;
  totalSellingPrice: number;

  currency = numeral();

  constructor(
    private _productService: ProductsService,
    private _utils: UtilsService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    this._loadProducts();
  }

  ngOnDestroy() {
    this._utils.unsubscribeSub(this._sub);
  }

  private _loadProducts() {
    this._utils.unsubscribeSub(this._sub);

    var totalCP:number=0;
    var totalSP:number=0;
    this._sub = this._productService.get().subscribe(
      data => {
        this.products = data;
        this.products.map(function(prdct) {
          totalCP += (prdct.cost * prdct.stock);
          totalSP += (prdct.selling_price * prdct.stock);
        });
        this.totalCostPrice = numeral(totalCP).format(this._utils.format);
        this.totalSellingPrice = numeral(totalSP).format(this._utils.format);
      }
    );
  }

  onUpdate(products: Product[]) {
    this.products = isArray(products) ? products : this.products;
  }

}
