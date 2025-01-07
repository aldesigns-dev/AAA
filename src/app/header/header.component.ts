import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  pageTitle: string = '';
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.activatedRoute.firstChild?.data.subscribe((data: any) => {
        this.pageTitle = data.pageTitle || '';
      });
    });
  }
}
