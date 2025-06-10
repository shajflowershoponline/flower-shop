import { Injectable } from '@angular/core';
import { OneSignal } from 'onesignal-ngx';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerUser } from '../model/customer-user';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {

  private data = new BehaviorSubject({});
  data$ = this.data.asObservable();

  constructor(private oneSignal: OneSignal, private storageService: StorageService) {
  }

  async init() {
    await this.oneSignal.init({
      appId: environment.oneSignalAppId,
    });
    if(!environment.production) {
      this.oneSignal.Notifications.requestPermission();
    }
    console.log("PushSubscription.permission ", this.oneSignal.Notifications?.permission);
    console.log("PushSubscription.token ", this.oneSignal.User?.PushSubscription?.token);
    // await this.oneSignal.User.addTag("Position", this.profile?.employee?.employeePosition?.name);
    const currentUser = this.storageService.getCurrentUser();
    if(currentUser && currentUser.email) {
      await this.oneSignal.login(currentUser?.email);
    }
    this.oneSignal.Notifications.addEventListener("foregroundWillDisplay", (e)=> {
      console.log("Notif in forground");
      console.log(e);
      this.notifChanged(e);
    })
  }
  notifChanged(data: any) {
    this.data.next(data)
  }

}
