import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayUserChartComponent } from './display-user-chart.component';

describe('DisplayUserChartComponent', () => {
  let component: DisplayUserChartComponent;
  let fixture: ComponentFixture<DisplayUserChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayUserChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayUserChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
