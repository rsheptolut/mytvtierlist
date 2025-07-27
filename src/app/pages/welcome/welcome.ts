import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomeComponent {
  imdbId = signal(localStorage.getItem('imdbId') || '');
  constructor(private router: Router) {}

  onGenerate() {
    if (this.imdbId()) {
      localStorage.setItem('imdbId', this.imdbId() as string);
      this.router.navigate(['/import'], { queryParams: { imdbId: this.imdbId() } });
    }
  }
}
