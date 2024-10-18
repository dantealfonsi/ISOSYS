import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { TermsComponent } from './terms/terms.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AdminControlComponent } from './admin-control/admin-control.component';
import { UnitComponent } from './unit/unit.component';
import { AuthGuard } from '../auth.guard';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch:'full'},
    {path: 'login',           component: LoginComponent},
    {path: 'register',        component: RegisterComponent},
    {path: 'forgotPassword',  component: ForgotPasswordComponent},
    {path: 'home',           component: LandingPageComponent},
    {path: 'about-us',           component: TermsComponent},
    {path: 'terms',           component: AboutUsComponent},
    {path: 'main',     component: AdminControlComponent, 
        children: [
          {path: 'unit',      component: UnitComponent},
        ],
      },
];
