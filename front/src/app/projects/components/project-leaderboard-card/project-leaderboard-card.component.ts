import { Component, Input, OnInit } from '@angular/core';
import moment from 'moment';
import { PullRequest } from '../../models/pullRequest.model';

@Component({
  selector: 'app-project-leaderboard-card',
  templateUrl: './project-leaderboard-card.component.html',
  styleUrls: ['./project-leaderboard-card.component.scss']
})
export class ProjectLeaderboardCardComponent implements OnInit {
  displayedColumns = ['email', 'points'];
  leaderboard: {email: string, points: number}[] = [];
  weekStartDate = moment().utcOffset(0, true).startOf('isoWeek');

  @Input() set pullRequests(prs: PullRequest[]) {
    if (prs) {
      this.calculateLeaderboard(prs);
    } else {
      this.leaderboard = [];
    }
  }

  private calculateLeaderboard(prs: PullRequest[]): void {
    const leaderboardMap = new Map<string, number>();

    prs.forEach(pr => {
      // get prs only from current week
      if (moment(pr.createdAt).isSameOrAfter(this.weekStartDate, 'days')) {
        if (!leaderboardMap.has(pr.creator)) {
          leaderboardMap.set(pr.creator, 0);
        }

        // get one point per created PR
        leaderboardMap.set(pr.creator, leaderboardMap.get(pr.creator) + 1);
      }
    });

    this.leaderboard = [];
    leaderboardMap.forEach((value, key) => {
      this.leaderboard.push({
        email: key,
        points: value
      });
    });
  }

  constructor() { }

  ngOnInit(): void {
  }

}
