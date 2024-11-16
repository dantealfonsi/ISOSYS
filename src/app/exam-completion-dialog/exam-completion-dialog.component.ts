import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-exam-completion-dialog',
  standalone: true,
  imports: [],
  templateUrl: './exam-completion-dialog.component.html',
  styleUrl: './exam-completion-dialog.component.css'
})
export class ExamCompletionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ExamCompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userMark: number }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
