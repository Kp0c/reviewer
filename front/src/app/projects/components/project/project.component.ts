import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';
import { first, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Project } from '../../models/project.model';
import { ProjectsService } from '../../services/projects.service';
import { UserNameMapping } from '../../models/usernameMapping.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/auth';
import * as moment from 'moment';
import { PullRequest } from '../../models/pullRequest.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  project: Project;
  pullRequests: PullRequest[];
  user: firebase.User;

  private destroy$ = new ReplaySubject(1);
  private pullRequestsSubscription: Subscription;

  constructor(private projectsService: ProjectsService,
              private activatedRoute: ActivatedRoute,
              private afAuth: AngularFireAuth) { }

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
          this.pullRequests = prs;
          this.user = user;
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
