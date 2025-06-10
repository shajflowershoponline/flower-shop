import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SystemConfigService } from 'src/app/services/system-config.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  title;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly systemConfigService: SystemConfigService,
  ) {
    this.title = this.route.snapshot.data["title"];
  }

  loadContent({ top, title, sub, description }) {
    if (document.querySelector("#topTitle")) {
      document.querySelector("#topTitle").innerHTML = top;
    }
    if (document.querySelector("#mainTitle")) {
      document.querySelector("#mainTitle").innerHTML = title;
    }
    if (document.querySelector("#subTitle")) {
      document.querySelector("#subTitle").innerHTML = sub;
    }
    if (document.querySelector("#description")) {
      document.querySelector("#description").innerHTML = description;
    }
  }

  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.action === 'updateContent' && message.data) {
        this.loadContent(message.data);
      } else if (message.action === 'reload') {
        window.location.reload();
      }
    });

    const jsonValue = this.systemConfigService.get("CLIENT_SITE_HISTORY_CONTENTS");
    const data = JSON.parse(jsonValue);
    if (data) {
      this.loadContent(data);
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    if (this.title === 'History') {
      document.querySelector("header").classList.add("hidden");
      document.querySelector("footer").classList.add("hidden");
    }
  }
}
