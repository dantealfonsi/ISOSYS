import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamCompletionDialogComponent } from './exam-completion-dialog.component';

describe('ExamCompletionDialogComponent', () => {
  let component: ExamCompletionDialogComponent;
  let fixture: ComponentFixture<ExamCompletionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamCompletionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamCompletionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
