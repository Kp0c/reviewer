import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-achievement',
  templateUrl: './achievement.component.html',
  styleUrls: ['./achievement.component.scss']
})
export class AchievementComponent implements OnInit {
  static readonly levelsMap: { [key: number]: { min: number, max: number }; } = {
    1: {min: 0, max: 1},
    2: {min: 1, max: 10},
    3: {min: 10, max: 100},
    4: {min: 100, max: 1000},
    5: {min: 1000, max: 10000},
  };
  static readonly maxLevel = Object.keys(AchievementComponent.levelsMap).length;

  @Input() name: string;
  @Input() imagesSrc: string;
  @Input() currentValue: number;
  constructor() { }

  ngOnInit(): void {
  }

  getCurrentIconSrc(): string {
    const level = this.getCurrentIconLevel();
    return `${this.imagesSrc}-${level}.png`;
  }

  getNextIconSrc(): string {
    const level = this.getCurrentIconLevel() + 1;
    return `${this.imagesSrc}-${level}.png`;
  }

  getCurrentPercentage(): number {
    const level = this.getCurrentIconLevel();
    const levelLimits = AchievementComponent.levelsMap[level];

    const width = levelLimits.max - levelLimits.min;
    const currentPos = this.currentValue - levelLimits.min;
    return currentPos / width * 100;
  }

  getCurrentMinValue(): number {
    const level = this.getCurrentIconLevel();
    return AchievementComponent.levelsMap[level].min;
  }

  getCurrentMaxValue(): number {
    const level = this.getCurrentIconLevel();
    return AchievementComponent.levelsMap[level].max;
  }

  getCurrentIconLevel(): number {
    const currenLevel = Object.keys(AchievementComponent.levelsMap).find(key => {
      const value = AchievementComponent.levelsMap[key];

      return this.currentValue >= value.min && this.currentValue < value.max;
    });
    return +currenLevel;
  }

  isMaxLevel(): boolean {
    return this.getCurrentIconLevel() === AchievementComponent.maxLevel;
  }
}
