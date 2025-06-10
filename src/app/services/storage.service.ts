import { Injectable } from '@angular/core';
import { CustomerUser } from '../model/customer-user';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getCurrentUser(): CustomerUser {
    let currentUser: any = this.get('currentUser');
    if(currentUser && currentUser !== "" && JSON.parse(currentUser) !== null && currentUser !== ''){
      const user: CustomerUser = JSON.parse(currentUser);
      if(!user) {
        return null;
      }
      return user;
    }
    else {return null;}
  }
  saveCurrentUser(value: CustomerUser){
    return this.set('currentUser', JSON.stringify(value));
  }
  getAccessToken(){
    return this.get('accessToken');
  }
  saveAccessToken(value: any){
    return this.set('accessToken', value);
  }
  getRefreshToken(){
    return this.get('refreshToken');
  }
  saveRefreshToken(value: any){
    return this.set('refreshToken', value);
  }
  getSessionExpiredDate(){
    return this.get('sessionExpiredDate');
  }
  saveSessionExpiredDate(value: any){
    return this.set('sessionExpiredDate', value);
  }
  getUnreadNotificationCount(){
    return this.get('unReadNotificationCount');
  }
  saveUnreadNotificationCount(value: any){
    return this.set('unReadNotificationCount', value);
  }
  getCurrentLocation(){
    let currentLocationJSON: any = this.get('currentLocation');
    if(JSON.parse(currentLocationJSON) !== null && currentLocationJSON !== ''){
      const currentLocation: {latitude: string, longitude: string} = JSON.parse(currentLocationJSON);
      if(!currentLocation) {
        return null;
      }
      return currentLocation;
    }
    else {return null;};
  }
  saveCurrentLocation(value: any){
    return this.set('currentLocation', JSON.stringify(value));
  }
  private set(key: string, value: any){
    localStorage.setItem(key, value);
  }
  private get(key: string){
    return localStorage.getItem(key);
  }
}
