import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  confirmationText: string;
  confirmButtonText: string;
  confirmButtonColor: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {confirmationText: string, confirmButtonText?: string, confirmButtonColor?: string}) { }

  ngOnInit(): void {
    this.confirmationText = this.data.confirmationText;
    this.confirmButtonText = this.data.confirmButtonText ?? 'OK';
    this.confirmButtonColor = this.data.confirmButtonColor ?? 'primary';
  }

}
