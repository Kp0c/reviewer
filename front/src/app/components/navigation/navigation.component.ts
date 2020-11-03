import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ProjectsService } from 'src/app/projects/services/projects.service';
import { Project } from 'src/app/projects/models/project.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  projects$: Observable<Project[]>;

  showProjects = false;

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: RouterEvent) => {
      this.showProjects = event.url !== '/login';

      if (this.showProjects) {
        if (!this.projects$) {
          this.projects$ = this.projectsService.getProjects();
        }
      } else {
        this.projects$ = null;
      }
    });
  }

  onSignOut(): void {
    this.router.navigate(['login']);
  }
}
