import { Component, Input, OnInit } from '@angular/core';
import { PullRequest } from '../../models/pullRequest.model';
import { LeaderboardBuilder, LeaderboardItem } from '../../models/leaderboard-builder.model';

@Component({
  selector: 'app-project-leaderboard-card',
  templateUrl: './project-leaderboard-card.component.html',
  styleUrls: ['./project-leaderboard-card.component.scss']
})
export class ProjectLeaderboardCardComponent implements OnInit {
  displayedColumns = ['email', 'created', 'reviewed', 'commented', 'points'];
  leaderboard: LeaderboardItem[] = [];

  pointsPerComment = 1;
  pointsPerCreatedRequest = 10;
  pointsPerReview = 5;

  @Input() set pullRequests(prs: PullRequest[]) {
    if (prs) {
      this.calculateLeaderboard(prs);
    } else {
      this.leaderboard = [];
    }
  }

  private calculateLeaderboard(prs: PullRequest[]): void {
    this.leaderboard = new LeaderboardBuilder({
      pointsPerComment: this.pointsPerComment,
      pointsPerCreatedRequest: this.pointsPerCreatedRequest,
      pointsPerReview: this.pointsPerReview
    }).addMeasures(prs).getLeaderboard();
  }

  constructor() { }

  ngOnInit(): void {
  }

}
