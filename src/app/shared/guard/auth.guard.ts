import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      let canActivate = false;
    const profile = this.storageService.getCurrentUser();
    if(!profile) {
      this.router.navigate(['login'], {
        queryParams: {ref: `${window.location.origin}/${state.url}`}
      });
      // window.location.href = window.location.href;
    }

    if(profile) {
      canActivate = true;
    }
    return canActivate;
  }

}
