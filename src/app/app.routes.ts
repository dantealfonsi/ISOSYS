import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch:'full'},
    {path: 'login',           component: LoginComponent},
    {path: 'register',        component: RegisterComponent},
    {path: 'forgotPassword',  component: ForgotPasswordComponent},
];
