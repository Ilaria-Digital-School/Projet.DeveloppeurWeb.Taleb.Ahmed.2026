import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Biography } from './biography/biography';
import { Concerts } from './concerts/concerts';
import { Contact } from './contact/contact';
import { Login } from './login/login';
import { Register } from './register/register';
import { UserDashbord } from './user-dashbord/user-dashbord';
import { AdminDashbord } from './admin-dashbord/admin-dashbord';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'biography', component: Biography },
  { path: 'concerts', component: Concerts },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'user-dashboard', component: UserDashbord },
  { path: 'admin-dashboard', component: AdminDashbord },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
