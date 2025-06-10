import { Category } from 'src/app/model/category';
import { CategoryService } from './../../services/category.service';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  viewMode: "GRID_4" | "GRID_3" | "LIST" = "GRID_4";
  categories: Category[] = [];
  isLoading = false;
  pages: number[] = [];
  order: any = { categoryId: "DESC" };
  filter: {
    apiNotation: string;
    filter?: any;
    name?: string;
    type?: string;
  }[] = [];
  pageIndex = 0;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  sortBy = new FormControl(1);
  constructor(private readonly categoryService: CategoryService) {

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCategories();
    this.sortBy.valueChanges.subscribe(res => {
      this.loadCategories();
    })
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  loadCategories() {
    if (Number(this.sortBy.value ?? 0) === 1) {
      this.order = { name: "ASC" };
    } else if (Number(this.sortBy.value ?? 0) === 2) {
      this.order = { name: "DESC" };
    }
    this.isLoading = true;
    try {
        this.categoryService.getAdvanceSearch({
          keywords: "",
          order: this.order,
          pageSize: this.pageSize,
          pageIndex: this.pageIndex,
        }).subscribe((res) => {
        this.isLoading = false;
        if (res.success) {
          this.categories = res.data.results;
          this.totalItems = res.data.total;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.pages = this.generatePageArray();

        }
      }, (res) => {
        this.isLoading = false;
      });
    } catch (ex) {
      this.isLoading = false;
    }
  }

  goToPage(index: number) {
    if (index < 0 || index >= this.totalPages) return;
    this.pageIndex = index;
    this.loadCategories();
  }

  generatePageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.pageIndex - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage >= this.totalPages) {
      endPage = this.totalPages - 1;
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/thumbnail-product.png';
  }
}
