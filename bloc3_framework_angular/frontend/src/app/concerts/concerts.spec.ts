import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Concerts } from './concerts';

describe('Concerts', () => {
  let component: Concerts;
  let fixture: ComponentFixture<Concerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Concerts],
    }).compileComponents();

    fixture = TestBed.createComponent(Concerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
