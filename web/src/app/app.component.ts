import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  $store = this.http
    .get('/api')
    .pipe(map((next) => ({ add: '0.0.1', ...next })));

  constructor(private http: HttpClient) {}
}
