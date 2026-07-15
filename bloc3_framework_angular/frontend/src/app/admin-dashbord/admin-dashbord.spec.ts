import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashbord } from './admin-dashbord';

describe('AdminDashbord', () => {
  let component: AdminDashbord;
  let fixture: ComponentFixture<AdminDashbord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashbord],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashbord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
