import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PullRequest } from '../../models/pullRequest.model';

@Component({
  selector: 'app-project-stat-card',
  templateUrl: './project-stat-card.component.html',
  styleUrls: ['./project-stat-card.component.scss']
})
export class ProjectStatCardComponent implements OnInit, OnChanges {
  pullRequestsCreated = 0;

  @Input() pullRequests: PullRequest[];
  @Input() user: firebase.User;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pullRequests?.currentValue && (changes.user?.currentValue || this.user)) {
      this.pullRequestsCreated = this.pullRequests.filter(pr => pr.creator === this.user.email).length;
    } else {
      this.pullRequestsCreated = 0;
    }
  }
}
