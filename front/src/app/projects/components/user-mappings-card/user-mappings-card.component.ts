import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../models/project.model';
import { UserNameMapping } from '../../models/usernameMapping.model';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-user-mappings-card',
  templateUrl: './user-mappings-card.component.html',
  styleUrls: ['./user-mappings-card.component.scss']
})
export class UserMappingsCardComponent implements OnInit {

  @Input() project: Project;

  constructor(private projectsService: ProjectsService,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  addNewMapping(): void {
    this.project.mappings.push({
      mappedName: '',
      reviewerEmail: ''
    });
  }

  deleteMapping(mapping: UserNameMapping): void {
    this.project.mappings = this.project.mappings.filter(map => map !== mapping);
  }

  async saveMapping(): Promise<void> {
    if (this.project.mappings.some(mapping => !mapping.mappedName || !mapping.reviewerEmail)) {
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
