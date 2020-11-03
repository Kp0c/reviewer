import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';
import { first, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Project } from '../../models/project.model';
import { ProjectsService } from '../../services/projects.service';
import { UserNameMapping } from '../../models/usernameMapping.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/auth';
import * as moment from 'moment';
import { PullRequest } from '../../models/pullRequest.model';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  displayedColumns = ['email', 'points'];
  project: Project;
  pullRequestsCreated = 0;
  leaderboard: {email: string, points: number}[] = [];
  weekStartDate = moment().utcOffset(0, true).startOf('isoWeek');

  private destroy$ = new ReplaySubject(1);
  private pullRequestsSubscription: Subscription;

  constructor(private projectsService: ProjectsService,
              private activatedRoute: ActivatedRoute,
              private afAuth: AngularFireAuth,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.projectsService.getProjectById(params.id).pipe(
        first()
      ).subscribe(project => {
        this.project = project;

        if (this.pullRequestsSubscription) {
          this.pullRequestsSubscription.unsubscribe();
        }

        this.pullRequestsSubscription = this.projectsService.getPullRequests(project.id).pipe(
          takeUntil(this.destroy$),
          withLatestFrom(this.afAuth.user)
        ).subscribe(([prs, user]) => {
          this.pullRequestsCreated = prs.filter(pr => pr.creator === user.email).length;

          this.calculateLeaderboard(prs);
        });
      });
    });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getLinkForHook(): string {
    if (this.project.host === 'Github') {
      return `https://us-central1-reviewer-cd0b3.cloudfunctions.net/githubHook?projectId=${this.project.id}`;
    }
  }

  addNewMapping(): void {
    this.project.mappings.push({
      githubName: '',
      reviewerEmail: ''
    });
  }

  deleteMapping(mapping: UserNameMapping): void {
    this.project.mappings = this.project.mappings.filter(map => map !== mapping);
  }

  async saveMapping(): Promise<void> {
    if (this.project.mappings.some(mapping => !mapping.githubName || !mapping.reviewerEmail)) {
      this.snackBar.open('All fields in mapping must be populated!', 'OK', {
        duration: 2000
      });

      return;
    }

    await this.projectsService.saveMappings(this.project.id, this.project.mappings);

    this.snackBar.open('Mappings are saved', 'OK', {
      duration: 2000
    });
  }
}
