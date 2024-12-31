import { Component, ElementRef, Inject, ViewChild,Renderer2} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-exam-completion-dialog',
  standalone: true,
  imports: [],
  templateUrl: './exam-completion-dialog.component.html',
  styleUrl: './exam-completion-dialog.component.css'
})
export class ExamCompletionDialogComponent {

  @ViewChild('confettiContainer', { static: false }) confettiContainer!: ElementRef;
  
  constructor(
    public dialogRef: MatDialogRef<ExamCompletionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userMark: number },
    private renderer: Renderer2,
    private router: Router,
  ) {}


  ngOnInit(): void {
    this.createConfetti();
  }

  createConfetti() {
    alert("ASDAS");
    for (let i = 0; i < 100; i++) {
      const confettiPiece = this.renderer.createElement('div');
      this.renderer.addClass(confettiPiece, 'confetti-piece');

      // Random color
      confettiPiece.style.setProperty('--color', this.getRandomColor());

      // Random position and delay
      confettiPiece.style.left = `${Math.random() * 100}%`;
      confettiPiece.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confettiPiece.style.animationDelay = `${Math.random() * 3}s`;

      this.renderer.appendChild(document.body, confettiPiece);
    }
  }

  getRandomColor() {
    const colors = ['#FFC0CB', '#FF69B4', '#FF1493', '#DB7093', '#FF4500', '#32CD32', '#1E90FF', '#FFD700'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  onNoClick(): void {
    this.dialogRef.close();
    this.router.navigate(['/profile']);
  }

}

