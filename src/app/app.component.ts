import { Component, ElementRef, HostListener, Inject, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, ResolveEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { OneSignalService } from './services/one-signal.service';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { RouteService } from './services/route.service';
import { LoaderService } from './services/loader.service';
import { Modal } from 'bootstrap';
import { SystemConfigService } from './services/system-config.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'web-client';
  lastScrollTop = 0;
  showScrollToTop = false;
  headerClass = "";
  footerClass = "";
  showLoader = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
    private router: Router,
    private renderer: Renderer2,
    private routeService: RouteService,
    private loaderService: LoaderService,
    private oneSignalService: OneSignalService,
    private systemConfigService: SystemConfigService) {
    this.oneSignalService.init();
    this.setupTitleListener();
    this.router.events.subscribe((event) => {
      if (event.constructor.name === 'NavigationStart') {
        this.systemConfigService.init();
      }
    });
  }
  private setupTitleListener() {
    this.loaderService.data$.subscribe((res: { show: boolean }) => {
      if (res.show && !this.showLoader) {
        this.showLoader = true;
      } else if(this.showLoader) {
        this.showLoader = false;
      }
    });
    this.router.events.pipe(filter(e => e instanceof ResolveEnd)).subscribe((e: any) => {
      const { data } = this.getDeepestChildSnapshot(e.state.root);
      this.routeService.changeData(data);
      if (data?.['title']) {
        this.title = data['title'];
        this.headerClass = data['headerClass'];
        this.footerClass = data['footerClass'];
        this.titleService.setTitle(`${this.title} | ${environment.appName}`);
      }
    });
  }


  ngAfterViewInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hash = window.location.hash;
        if (hash) {
          const targetId = hash.replace('#', '');
          setTimeout(() => this.scrollToWithBounce(targetId), 100);
        }
      }
    });

    // Listen to anchor clicks manually in case router doesn't trigger
    this.renderer.listen(document, 'click', (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href?.startsWith('#')) {
          event.preventDefault();
          const targetId = href.substring(1);
          this.scrollToWithBounce(targetId);
        }
      }
    });
  }


  getDeepestChildSnapshot(snapshot: ActivatedRouteSnapshot) {
    let deepestChild = snapshot.firstChild;
    while (deepestChild?.firstChild) {
      deepestChild = deepestChild.firstChild
    };
    return deepestChild || snapshot
  }

  private scrollToWithBounce(id: string) {
    const target = this.document.getElementById(id);
    if (!target) return;

    const offset = -200; // adjust for fixed headers
    const pullDown = 60;

    const targetY =
      window.pageYOffset + target.getBoundingClientRect().top + offset;
    const overshootY = targetY + pullDown;

    window.scrollTo({ top: overshootY, behavior: 'smooth' });

    setTimeout(() => {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }, 400);
  }
}
