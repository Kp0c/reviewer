import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from 'src/environments/environment';
import { NavigationComponent } from './components/navigation/navigation.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AngularFireModule } from '@angular/fire';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { NewProjectComponent } from './projects/components/new-project/new-project.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectComponent } from './projects/components/project/project.component';
import { MatDividerModule } from '@angular/material/divider';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ProjectInfoCardComponent } from './projects/components/project-info-card/project-info-card.component';
import { ProjectLeaderboardCardComponent } from './projects/components/project-leaderboard-card/project-leaderboard-card.component';
import { ProjectStatCardComponent } from './projects/components/project-stat-card/project-stat-card.component';
import { UserMappingsCardComponent } from './projects/components/user-mappings-card/user-mappings-card.component';
import { ProjectUsersCardComponent } from './projects/components/project-users-card/project-users-card.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AchievementComponent } from './projects/components/achievement/achievement.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    LoginComponent,
    HomeComponent,
    NewProjectComponent,
    ProjectComponent,
    ConfirmDialogComponent,
    ProjectInfoCardComponent,
    ProjectLeaderboardCardComponent,
    ProjectStatCardComponent,
    UserMappingsCardComponent,
    ProjectUsersCardComponent,
    AchievementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    NgxAuthFirebaseUIModule.forRoot(environment.firebase, () => 'Reviewer', {
      authGuardFallbackURL: 'login',
      authGuardLoggedInURL: 'home',
      toastMessageOnAuthSuccess: false
    }),
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatSnackBarModule,
    MatDividerModule,
    ClipboardModule,
    MatTableModule,
    MatDialogModule,
    MatTabsModule,
    MatChipsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  providers: [],
  entryComponents: [
    ConfirmDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
