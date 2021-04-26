import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Quick Emoji';
  emojiImages: string[] = [
    'peace.png',
    'poop.png',
    'wave.png',
    'heart-eyes.png',
    'devil.png',
    'heart.png',
  ];
  emojiIndex: number = 0;
  emoji: string = this.emojiImages[0];
  constructor() {
    setInterval(() => {
      this.emoji = this.emojiImages[this.emojiIndex];
      this.emojiIndex++;
      if (this.emojiIndex > this.emojiImages.length - 1) this.emojiIndex = 0;
    }, 1000);
  }
}
