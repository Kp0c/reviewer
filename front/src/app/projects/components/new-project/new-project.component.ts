import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProjectsService } from './../../services/projects.service';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent {
  name: string;
  description: string;
  host: string;

  @ViewChild('newProjectForm') private newProjectForm: NgForm;

  constructor(private snackBar: MatSnackBar,
              private projects: ProjectsService,
              private router: Router) { }

  async save(): Promise<void> {
    this.newProjectForm.form.markAllAsTouched();

    if (!this.newProjectForm.valid) {
      this.snackBar.open('All fields must be populated', 'OK', {
        duration: 2000
      });
    } else {
      try {
        this.projects.addNewProject({
          name: this.name,
          description: this.description,
          host: this.host
        });

        this.router.navigate(['projects']);
      } catch (err) {
        this.snackBar.open(err, 'OK', {
          duration: 2000
        });
      }
    }
  }
}
