import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoggedInGuard } from 'ngx-auth-firebaseui';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NewProjectComponent } from './projects/components/new-project/new-project.component';
import { ProjectComponent } from './projects/components/project/project.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [LoggedInGuard],
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'projects',
    canActivate: [LoggedInGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'new',
        component: NewProjectComponent
      },
      {
        path: ':id',
        component: ProjectComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
