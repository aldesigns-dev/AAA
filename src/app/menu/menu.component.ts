import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, MatListModule, MatButtonModule, MatToolbarModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MenuComponent {

}
