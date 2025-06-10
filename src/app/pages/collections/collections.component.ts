import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Collection } from 'src/app/model/collection';
import { CollectionService } from 'src/app/services/collection.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent {
  viewMode: "GRID_4" | "GRID_3" | "LIST" = "GRID_4";
  collections: Collection[] = [];
  isLoading = false;
  pages: number[] = [];
  order: any = { collectionId: "DESC" };
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
  constructor(private readonly collectionService: CollectionService) {

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadCollections();
    this.sortBy.valueChanges.subscribe(res => {
      this.loadCollections();
    })
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  loadCollections() {
    if (Number(this.sortBy.value ?? 0) === 1) {
      this.order = { name: "ASC" };
    } else if (Number(this.sortBy.value ?? 0) === 2) {
      this.order = { name: "DESC" };
    }
    this.isLoading = true;
    try {
        this.collectionService.getAdvanceSearch({
          keywords: "",
          order: this.order,
          pageSize: this.pageSize,
          pageIndex: this.pageIndex,
        }).subscribe((res) => {
        this.isLoading = false;
        if (res.success) {
          this.collections = res.data.results;
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
    this.loadCollections();
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
