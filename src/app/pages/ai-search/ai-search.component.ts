import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ai-search',
  templateUrl: './ai-search.component.html',
  styleUrl: './ai-search.component.scss'
})
export class AISearchComponent {
  promptData: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.promptData = navigation?.extras?.state?.['prompt'] ?? null;

    console.log('Prompt Received:', this.promptData);
  }
}
