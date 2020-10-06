import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Weather } from '../models/weather';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private url: string = environment.server_base_url;

  constructor(private httpClient: HttpClient) { }

  getWeather(): Promise<Weather> {
    return new Promise<Weather>((resolve, reject) => {
      this.httpClient.get<Weather>(this.url + '/weather')
        .toPromise()
        .then(
          res => { // Success
          resolve(res);
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
  }
}
