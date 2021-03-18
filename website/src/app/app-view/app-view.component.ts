import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-view',
  templateUrl: './app-view.component.html',
  styleUrls: ['./app-view.component.scss'],
})
export class AppViewComponent implements OnInit {
  x: number = 0;
  y: number = 0;
  constructor() {}

  ngOnInit(): void {}

  onMouseMove(event: MouseEvent) {
    this.y = map(event.offsetY, 0, 462, 10, -10); // this.update(event);
    this.x = map(event.offsetX, 0, 399, -5, 5);
  }

  update(event: MouseEvent) {
    // console.log(event.target.e.clientX);
  }
}

function map(
  num: number,
  in_min: number,
  in_max: number,
  out_min: number,
  out_max: number
): number {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
