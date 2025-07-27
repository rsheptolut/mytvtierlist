import { Component, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Title } from '../../model/title';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [MatProgressSpinnerModule, FormsModule, RouterModule],
  templateUrl: './import.html',
  styleUrls: ['./import.css']
})
export class ImportComponent implements AfterViewChecked, AfterViewInit {
  log: string[] = [
    'Starting import...'
  ];

  @ViewChild('logArea') logArea!: ElementRef<HTMLTextAreaElement>;

  imdbId: string = '';
  constructor(private cdr: ChangeDetectorRef, private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngAfterViewChecked() {
    if (this.logArea) {
      this.logArea.nativeElement.scrollTop = this.logArea.nativeElement.scrollHeight;
    }
  }

  public async ngAfterViewInit() {
    // Get imdbId from query params
    this.route.queryParams.subscribe(params => {
      this.imdbId = params['imdbId'] || '';
      this.import();
    });
  }

  private async import() {
    if (!this.imdbId) {
      this.addLog('No IMDB profile ID provided.');
      return;
    }
    this.addLog('Fetching titles from IMDB.');
    
    const titles = await this.getTitles(this.imdbId);
    if (!titles) {
      return;
    }
    const ids = titles.map((i: any) => i.id);
    
    const ratings = await this.getRatings(ids);

    if (!ratings) {
      return;
    }

    for (const title of titles) {
      const rating = ratings.find((r: any) => r.id === title.id);
      if (rating) {
        title.rating = rating.rating;
      }
    }

    localStorage.setItem('importedTitles', JSON.stringify(titles));

    this.router.navigate(['/tier-list']);
  }

  private async getTitles(imdbId: string) {
    const headers = new HttpHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    });
    let result: string | undefined = "";
    try {
      const url = `https://cors.shru.workers.dev?https://www.imdb.com/user/${this.imdbId}/ratings/?view=compact`;
      result = await this.http.get(
        url,
        { headers, responseType: 'text' }
      ).toPromise();
      if (!result) {
        this.addLog('Failed to fetch data from IMDB.');
        return;
      }
    } catch (error) {
      this.addLog(`Error fetching data: ${error}`);
      console.error(error);
      return;
    }
    this.addLog('Parsing titles from IMDB.');
    const iStart = `<script id="__NEXT_DATA__" type="application/json">`;
    const iEnd = `</script>`;
    const i0 = result.indexOf(iStart);
    const i1 = result.indexOf(`</script>`, i0);
    const jsonData = result.substring(i0 + iStart.length, i1);
    const json = JSON.parse(jsonData);
    const items = (json.props.pageProps.mainColumnData.advancedTitleSearch.edges as []).map((edge: any) => edge.node.title);
    const titlesParsed: Title[] = items.map((i: any) => {
      return {
        id: i.id as string,
        title: i.titleText.text as string,
        type: i.titleType.text as string,
        image: i.primaryImage?.url || '' as string,
        rating: null
      };
    });
    return titlesParsed;
    }

  private async getRatings(ids: string[]) {
    
    this.addLog('Fetching your ratings from IMDB.');
    const headers = new HttpHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
      'Accept': 'application/graphql+json, application/json',
      'Accept-Language': 'en-US,en;q=0.5',
    });
    let result = null;
    try {
      const url = `https://api.graphql.imdb.com/`;
      const request = {"operationName":"PersonalizedUserData","variables":{"locale":"en-US","idArray": ids,"includeUserData":false,"location":{"latLong":{"lat":"-27.5","long":"153.02"}},"otherUserId":"ur150921972","fetchOtherUserRating":true},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"afebb5841a7a0072bc4d4c3eb29c64832e531a0846c564caf482f814e8ce12c7"}}}
      result = await this.http.post(
        url, request,
        { headers, responseType: 'json' }
      ).toPromise();
      if (!result) {
        this.addLog('Failed to fetch data from IMDB.');
        return;
      }
    } catch (error) {
      this.addLog(`Error fetching data: ${error}`);
      console.error(error);
      return;
    }
    this.addLog('Parsing ratings from IMDB.');
    
    const ratings = ((result as any).data.titles as []).map((title: any) => {
      return {
        id: title.id as string,
        rating: title.otherUserRating.value as number
      }
    });
    
    return ratings;
  }

  private delay(arg0: number) {
    return new Promise(resolve => setTimeout(resolve, arg0));
  }

  // Simulate log updates for demonstration
  addLog(message: string) {
    this.log.push(message);
    this.cdr.detectChanges();
  }
}
