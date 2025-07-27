import { Routes } from '@angular/router';

import { WelcomeComponent } from './pages/welcome/welcome';
import { ImportComponent } from './pages/import/import';
import { TierListComponent } from './pages/tier-list/tier-list';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'import', component: ImportComponent },
  { path: 'tier-list', component: TierListComponent },
];
