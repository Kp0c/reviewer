import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProvider } from 'ngx-auth-firebaseui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  providers: AuthProvider[] = [
    AuthProvider.Google,
    AuthProvider.EmailAndPassword
  ];

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
  }

  onSuccess(): void {
    const redirectUrlFromQueryParams = this.activatedRoute.snapshot.queryParams.redirectUrl;
    const redirectUrl = redirectUrlFromQueryParams ? redirectUrlFromQueryParams : '';
    this.router.navigateByUrl(redirectUrl);
  }
}
