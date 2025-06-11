import { AiSearchService } from './../../services/ai-search.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/model/category';
import { Collection } from 'src/app/model/collection';
import { CustomerUser } from 'src/app/model/customer-user';
import { Product } from 'src/app/model/product';
import { CartService } from 'src/app/services/cart.service';
import { CustomerUserWishlistService } from 'src/app/services/customer-user-wish-list.service';
import { ModalService, MODAL_TYPE } from 'src/app/services/modal.service';
import { StorageService } from 'src/app/services/storage.service';
import { QuickProductViewModalComponent } from 'src/app/shared/quick-product-view-modal/quick-product-view-modal.component';

@Component({
  selector: 'app-ai-search',
  standalone: false,
  templateUrl: './ai-search.component.html',
  styleUrl: './ai-search.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]

})
export class AISearchComponent {
  promptData: any;

  currentUser: CustomerUser;
  products: Product[] = [];
  categories: Category[] = [];
  collections: Collection[] = [];
  colors: { name: string; count: number }[] = [];
  error: string;
  cartCount = 0;
  @ViewChild('quickView') quickView!: QuickProductViewModalComponent;

  isLoading = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private readonly customerUserWishlistService: CustomerUserWishlistService,
    private readonly aiSearchService: AiSearchService,
    private readonly storageService: StorageService,
    private modalService: ModalService,
    private snackBar: MatSnackBar,
    private readonly cartService: CartService
  ) {
    this.currentUser = this.storageService.getCurrentUser();
    console.log('Prompt Received:', this.promptData);

    this.aiSearchService.aiPrompt$.subscribe(res => {
      this.promptData = res;
      if(this.promptData && this.promptData !== "") {
        this.sendMessage();
      } else {
        this.products = [];
        this.categories = [];
        this.collections = [];
        this.isLoading = false;
        this.aiSearchService.setIsAIResultFeeding(false);
      }
    });
  }
  ngOnDestroy(): void {
    this.aiSearchService.setAIPrompt("");
  }

  sendMessage() {
    const input = this.promptData?.trim();
    if (!input) return;
    try {
      this.isLoading = true;
      this.aiSearchService.setIsAIResultFeeding(true);
      this.aiSearchService.getAiSearchResponse({
        customerUserId: this.currentUser?.customerUserId,
        query: input
      })
        .subscribe(res => {
          this.isLoading = false;

          if(res.success) {
            const products = res.data?.results?.products ?? [];
            this.products = [];
            for (let index = 0; index < products.length; index++) {
              setTimeout(() => {
                this.products.push({ ...products[index] });
                if((index === products.length - 1)) {
                  this.aiSearchService.setIsAIResultFeeding(false);
                }
              }, index * 150); // 150ms delay per item
            }
          } else {
            this.aiSearchService.setIsAIResultFeeding(false);
          }

        }, (res) => {
          this.isLoading = false;
          this.aiSearchService.setIsAIResultFeeding(false);
        });
    } catch (ex) {
      this.isLoading = false;
      this.aiSearchService.setIsAIResultFeeding(false);
    }
  }

  onOpenQuickView(product: Product) {
    this.quickView.showModal(product);
  }

  onAddToCart(product: Product) {
    try {
      this.modalService.openPromptModal({
        header: "Add to Cart",
        description: `Do you want to add "${product.name}" to your cart?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.cartService.create({
            productId: product?.productId,
            customerUserId: this.currentUser?.customerUserId,
            quantity: "1",
            price: product?.price,
          }).subscribe(res => {
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to cart successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  this.cartService.setCartCount(this.cartCount + 1);
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error Adding to Cart!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.error = res.error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.modalService.openResultModal({
              success: false,
              header: "Error Adding to Cart!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          });
        }
      });
    } catch (ex) {
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.modalService.openResultModal({
        success: false,
        header: "Error Adding to Cart!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }

  onAddToWishlist(product: Product) {
    if (product.iAmInterested) {
      this.modalService.openPromptModal({
        header: "Already added!",
        description: `Do you want to remove "${product.name}" to your wishlist?`,
        confirmText: "Yes, Remove it",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);
          this.customerUserWishlistService.delete(product.customerUserWishlist?.customerUserWishlistId).subscribe(res => {
            // this.loadProducts();
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower removed!",
                description: "Flower removed from wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error removing from wishlist!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          });
        }
      });
      return
    }
    try {
      this.modalService.openPromptModal({
        header: "Add to Wishlist?",
        description: `Do you want to add "${product.name}" to your wishlist?`,
        confirmText: "Yes",
        confirm: () => {
          this.modalService.close(MODAL_TYPE.PROMPT);

          this.customerUserWishlistService.create({
            productId: product?.productId,
            customerUserId: this.currentUser?.customerUserId,
          }).subscribe(res => {
            if (res.success) {
              this.modalService.openResultModal({
                success: true,
                header: "Flower Added!",
                description: "Added to wishlist successfully!",
                confirm: () => {
                  this.modalService.close(MODAL_TYPE.RESULT);
                  // this.loadProducts();
                }
              });
            } else {
              this.error = res.message;
              this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
              this.modalService.openResultModal({
                success: false,
                header: "Error Adding to wishlist!",
                description: this.error,
                confirm: () => {
                  this.modalService.closeAll();
                }
              });
            }
          }, (res) => {
            this.error = res.error.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.modalService.openResultModal({
              success: false,
              header: "Error Adding to wishlist!",
              description: this.error,
              confirm: () => {
                this.modalService.closeAll();
              }
            });
          });
        }
      });
    } catch (ex) {
      this.error = ex.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.modalService.openResultModal({
        success: false,
        header: "Error Adding to wishlist!",
        description: this.error,
        confirm: () => {
          this.modalService.closeAll();
        }
      });
    }
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../assets/images/thumbnail-product.png';
  }
}
