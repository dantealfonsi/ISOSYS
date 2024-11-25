import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrollComponent } from './troll.component';

describe('TrollComponent', () => {
  let component: TrollComponent;
  let fixture: ComponentFixture<TrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
