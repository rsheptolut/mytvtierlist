import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '../../model/title';
import { Tier } from '../../model/tier';

@Component({
  selector: 'app-tier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tier-list.html',
  styleUrls: ['./tier-list.css']
})
export class TierListComponent implements AfterViewInit {

  filter = '';
  tiers: Tier[] = [];

  async ngAfterViewInit() {
    await this.loadShows();
  }
  loadShows() {
    const titles = JSON.parse(localStorage.getItem('importedTitles') || '[]') as Title[];
    for (const title of titles) {
      if (title.rating) {
        const tierLabel = this.ratingToTier(title.rating as number);
        let tier = this.tiers.find(t => t.label === tierLabel);
        if (!tier) {
          tier = { label: this.ratingToTier(title.rating as number), color: 'var(--' + tierLabel.toLowerCase(), titles: []};
          this.tiers.push(tier);
        }
        tier.titles.push(title);
      }
    };
    this.tiers.sort((a, b) => {
      const order = ['S', 'A', 'B', 'C', 'D', 'F'];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });
  }
  
 ratingToTier(rating: number): string {
  return (
    rating >= 10 ? 'S' :
    rating >= 9  ? 'A' :
    rating >= 8  ? 'B' :
    rating >= 7  ? 'C' :
    rating >= 6  ? 'D' :
    'F'
  );
}

// const groups: { [key: string]: Rating[] } = {
//   'S': [],
//   'A': [],
//   'B': [],
//   'C': [],
//   'D': [],
//   'F': []
// };

  // getFilteredShows(shows: Show[]) {
  //   if (!this.filter.trim()) return shows;
  //   return shows.filter(show => show.title.toLowerCase().includes(this.filter.trim().toLowerCase()));
  // }
}
