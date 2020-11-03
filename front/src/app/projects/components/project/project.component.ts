import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { Project } from '../../models/project.model';
import { ProjectsService } from '../../services/projects.service';
import { UserNameMapping } from '../../models/usernameMapping.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {
  project: Project;

  private destroy$ = new ReplaySubject(1);

  constructor(private projectsService: ProjectsService,
              private activatedRoute: ActivatedRoute,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.activatedRoute.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.projectsService.getProjectById(params.id).pipe(
        first()
      ).subscribe(project => this.project = project);
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
