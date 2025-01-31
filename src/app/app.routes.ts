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
import { ManageLessonsComponent } from './manage-lessons/manage-lessons.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageAdminsComponent } from './manage-admins/manage-admins.component';
import { AddAdminsComponent } from './add-admins/add-admins.component';
import { ViewLessonsComponent } from './view-lessons/view-lessons.component';
import { ViewUnitsComponent } from './view-units/view-units.component';
import { ViewExamComponent } from './view-exam/view-exam.component';
import { ManageExamsComponent } from './manage-exams/manage-exams.component';
import { ExamComponent } from './exam/exam.component';
import { ProfileComponent } from './profile/profile.component';
import { IndexComponent } from './index/index.component';
import { ReportComponent } from './report/report.component';
import { TrollComponent } from './troll/troll.component';

export const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch:'full'},
    {path: 'login',           component: LoginComponent},
    {path: 'register',        component: RegisterComponent},
    {path: 'forgotPassword',  component: ForgotPasswordComponent},
    {path: 'home',           component: LandingPageComponent},
    {path: 'about-us',           component: AboutUsComponent},
    {path: 'terms',           component: TermsComponent},
    {path: 'view-lessons/:id/:lesson_order', component: ViewLessonsComponent},
    {path: 'view-exam/:id/:exam_id/:exam_order', component: ExamComponent},
    {path: 'view-units',           component: ViewUnitsComponent},
    {path: 'profile',           component: ProfileComponent},
    {path: 'main',     component: AdminControlComponent, 
        children: [
          {path:'troll', component: TrollComponent},
          {path: 'unit',      component: UnitComponent},
          {path: 'lessons/:id',      component: ManageLessonsComponent},
          {path: 'user',      component: ManageUsersComponent},
          {path: 'admin',      component: ManageAdminsComponent},
          {path: 'add-admin',      component: AddAdminsComponent},
          {path: 'exam',      component: ViewExamComponent},
          {path: 'manage-exams/:id',      component: ManageExamsComponent},
          {path: 'report',      component: ReportComponent},
          {path: 'index',      component: IndexComponent}


        ],
      },
];
