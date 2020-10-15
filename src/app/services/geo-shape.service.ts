import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from './../../environments/environment';

export class GeoShape {
  id: string;
  name: string;
  feature: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeoShapeService {

  private readonly _urls = {
    germany: '/assets/bundesland.json',
    poland: 'https://gist.githubusercontent.com/filipstachura/391ecb779d56483c070616a4d9239cc7/raw/b0793391ab0478e0d92052d204e7af493a7ecc92/poland_woj.json',
    all: '/assets/european-union-countries.json'
  }

  constructor(private http: HttpClient) {
    this.germany$ = this.http.get<any>(environment.base_href + this._urls.germany)
      .pipe(map(x => {
        return x.features.map(f => {
          if (!this.germanyNutsToFips10Map.has(f.properties.nuts)) throw Error(`Unmappable nuts value '${f.properties.nuts}' while loading german provinces.`);

          const id = this.germanyNutsToFips10Map.get(f.properties.nuts);
          const name = `${f.properties.bez} ${f.properties.gen}`;
          return { id, name, feature: { ...f, id, properties: { ...f.properties, id, name } } };
        });
      }))
      .pipe(shareReplay(1));

    this.poland$ = this.http.get<any>(this._urls.poland)
      .pipe(map(x => {
        return x.features.map(f => {
          if (!this.polandID1ToFips10Map.has(f.properties.ID_1)) throw new Error(`Unmappable id_1 value '${f.properties.ID_1}' while loading polish provinces.`)

          const id = this.polandID1ToFips10Map.get(f.properties.ID_1);
          return {
            id: id,
            name: f.properties.NAME_1,
            feature: { ...f, properties: { name: f.properties.NAME_1, id: id }, id }
          };
        });
      }))
      .pipe(shareReplay(1));

    this.all$ = this.http.get<any>(environment.base_href + this._urls.all)
      .pipe(map(x => {
        return x.features.map(f => {
          const id = f.properties.fips_10;
          const name = f.properties.name_sort;
          return { id, name, feature: { ...f, id, properties: { ...f.properties, id, name } } };
        })
      }))
      .pipe(shareReplay(1));
  }

  private germanyNutsToFips10Map: Map<string, string> = new Map<string, string>([
    ['DE2', 'GM02'],
    ['DE6', 'GM04'],
    ['DED', 'GM13'],
    ['DE3', 'GM16'],
    ['DEF', 'GM10'],
    ['DEB', 'GM08'],
    ['DEE', 'GM14'],
    ['DE5', 'GM03'],
    ['DE8', 'GM12'],
    ['DEC', 'GM09'],
    ['DEA', 'GM07'],
    ['DE7', 'GM05'],
    ['DE9', 'GM06'],
    ['DE4', 'GM11'],
    ['DEG', 'GM15'],
    ['DE1', 'GM01']
  ]);

  private polandID1ToFips10Map: Map<number, string> = new Map<number, string>([
    [1, 'PL74'],
    [2, 'PL84'],
    [3, 'PL86'],
    [4, 'PL73'],
    [5, 'PL77'],
    [6, 'PL72'],
    [7, 'PL75'],
    [8, 'PL76'],
    [9, 'PL78'],
    [10, 'PL79'],
    [11, 'PL81'],
    [12, 'PL82'],
    [13, 'PL83'],
    [14, 'PL80'],
    [15, 'PL85'],
    [16, 'PL87']
  ]);

  germany$: Observable<GeoShape[]>;

  poland$: Observable<GeoShape[]>;

  all$: Observable<GeoShape[]>;
}
