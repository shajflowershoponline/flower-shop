import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared/guard/auth.guard';
import { HistoryComponent } from './pages/about-us/history/history.component';
import { PolicyComponent } from './pages/policy/policy.component';



const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'auth', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'home',
    data: { title: 'Home', headerClass: 'header-transparent' },
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'search',
    canActivate: [AuthGuard],
    data: { title: 'Search', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'ai-search',
    canActivate: [AuthGuard],
    data: { title: 'AI Search', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/ai-search/ai-search.module').then(m => m.AISearchModule)
  },
  {
    path: 'product/:sku',
    canActivate: [AuthGuard],
    data: { title: 'Search', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'categories',
    canActivate: [AuthGuard],
    data: { title: 'Categories', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesModule)
  },
  {
    path: 'collections',
    canActivate: [AuthGuard],
    data: { title: 'Collections', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/collections/collections.module').then(m => m.CollectionsModule)
  },
  {
    path: 'about-us',
    data: { title: 'About Us' },
    loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule)
  },
  {
    path: 'history',
    data: { title: 'History' },
    component: HistoryComponent
  },
  {
    path: 'contact-us',
    data: { title: 'Contact Us' },
    loadChildren: () => import('./pages/contact-us/contact-us.module').then(m => m.ContactUsModule)
  },
  {
    path: 'cart',
    data: { title: 'Cart' },
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'checkout',
    data: { title: 'Checkout' },
    loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutModule)
  },
  {
    path: 'account',
    canActivate: [AuthGuard],
    data: { title: 'Account', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
  },
  {
    path: 'login',
    data: { title: 'Login', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'register',
    data: { title: 'Register', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule)
  },
  {
    path: 'forgot-password',
    data: { title: 'Forgot Password', footerClass: 'mt-no-text' },
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  {
    path: 'policy',
    data: { title: 'Policy', footerClass: 'mt-no-text' },
    component: PolicyComponent
  },
  { path: '**', redirectTo: '' }  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
