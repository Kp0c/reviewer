import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { Project } from '../../models/project.model';
import { map, startWith, takeUntil, withLatestFrom } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { ProjectsService } from '../../services/projects.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-users-card',
  templateUrl: './project-users-card.component.html',
  styleUrls: ['./project-users-card.component.scss']
})
export class ProjectUsersCardComponent implements OnInit, OnDestroy {
  allUsers: User[];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  userCtrl = new FormControl();
  filteredUsers$: Observable<User[]>;

  @Input() project: Project;

  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  private destroy$ = new ReplaySubject(1);

  constructor(private userService: UserService,
              private projectsService: ProjectsService,
              private snackBar: MatSnackBar) {
    this.filteredUsers$ = this.userCtrl.valueChanges.pipe(
      // tslint:disable-next-line: deprecation
      startWith(null),
      map((input) => input ? this.filter(input) : this.allUsers)
    );
  }

  getUserTextById(uid: string): string {
    const user = this.allUsers?.find(userInColl => userInColl.uid === uid);

    if (!user) {
      return `${uid} <user not found>`;
    }

    return `${user.displayName} (${user.email})`;
  }

  ngOnInit(): void {
    this.userService.getAllUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => this.allUsers = users);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  remove(uid: string): void {
    if (uid === this.project.owner) {
      this.snackBar.open('You acnnot remove Owner from Users!', 'OK', {
        duration: 2000
      });
      return;
    }

    const index = this.project.users.indexOf(uid);

    if (index >= 0) {
      this.project.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.project.users.push(event.option.value.uid);
    this.userInput.nativeElement.value = '';
    this.userCtrl.setValue(null);
  }

  filter(filter: string): User[] {
    if (typeof filter !== 'string') {
      return;
    }

    const filterValue = filter.toLowerCase();

    return this.allUsers.filter(user =>
      user.displayName.toLowerCase().includes(filterValue) ||
      user.email.toLowerCase().includes(filterValue)
    );
  }

  async saveUsers(): Promise<void> {
    await this.projectsService.saveUsers(this.project.id, this.project.users);

    this.snackBar.open('Mappings are saved', 'OK', {
      duration: 2000
    });
  }
}
