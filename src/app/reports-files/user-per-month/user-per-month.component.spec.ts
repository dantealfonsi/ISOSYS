import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPerMonthComponent } from './user-per-month.component';

describe('UserPerMonthComponent', () => {
  let component: UserPerMonthComponent;
  let fixture: ComponentFixture<UserPerMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPerMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPerMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
