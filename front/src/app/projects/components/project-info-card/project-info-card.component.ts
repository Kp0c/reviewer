import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { Project } from '../../models/project.model';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-project-info-card',
  templateUrl: './project-info-card.component.html',
  styleUrls: ['./project-info-card.component.scss']
})
export class ProjectInfoCardComponent implements OnInit {
  @Input() project: Project;
  @Input() user: firebase.User;

  constructor(private dialog: MatDialog,
              private router: Router,
              private projectsService: ProjectsService,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  getLinkForHook(): string {
    if (this.project.host === 'Github') {
      return `https://us-central1-reviewer-cd0b3.cloudfunctions.net/githubHook?projectId=${this.project.id}`;
    }
  }

  deleteProject(): void {
    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        confirmationText: '<p>This will delete a project and all associated data (User mappings, statistics and other).</p><p>Do you want to continue?</p>',
        confirmButtonText: 'Delete',
        confirmButtonColor: 'warn'
      }
    }).afterClosed().subscribe(async res => {
      if (res) {
        await this.projectsService.deleteProject(this.project.id);

        this.snackBar.open('Project is removed.', 'OK', {
          duration: 2000
        });

        this.router.navigate(['projects']);
      }
    });
  }

}
