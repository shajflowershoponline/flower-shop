import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Modal } from 'bootstrap';
/* eslint-disable @typescript-eslint/naming-convention */
export const MODAL_TYPE = {
  PROMPT: '.prompt-modal',
  RESULT: '.result-modal',
};

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  modals: { name: string; instance: Modal }[] = [];
  constructor() {
  }

  openResultModal(params: {
    success: boolean;
    header: string;
    description: string;
    confirm?: any
  }) {
    let modalElement = document.querySelector(MODAL_TYPE.RESULT);
    modalElement.querySelector(".modal-title").innerHTML = params.header;
    modalElement.querySelector(".modal-desc").innerHTML = params.description;

    const confirm = modalElement.querySelector(".modal-confirm");
    const newButton = confirm.cloneNode(true);
    modalElement.querySelector(".modal-confirm").replaceWith(newButton);
    modalElement.querySelector(".modal-confirm").addEventListener("click", params.confirm);
    if (params.success) {
      modalElement.querySelector(".result-icon").classList.remove("fa-exclamation-circle");
      modalElement.querySelector(".result-icon").classList.remove("text-danger");
      modalElement.querySelector(".result-icon").classList.add("fa-check-circle");
      modalElement.querySelector(".result-icon").classList.add("text-success");
    } else {
      modalElement.querySelector(".result-icon").classList.remove("fa-check-circle");
      modalElement.querySelector(".result-icon").classList.remove("text-success");
      modalElement.querySelector(".result-icon").classList.add("fa-exclamation-circle");
      modalElement.querySelector(".result-icon").classList.add("text-danger");
    }
    if (this.modals.some(x => x.name === MODAL_TYPE.RESULT)) {
      this.modals.find(x => x.name === MODAL_TYPE.RESULT).instance.show();
    } else {
      const modalInstance = new Modal(modalElement);
      modalInstance.show();
      this.modals.push({
        name: MODAL_TYPE.RESULT,
        instance: modalInstance,
      });
    }
  }

  close(name: string) {
    if (this.modals.some(x => x.name === name)) {
      this.modals.filter(x => x.name === name).forEach((modal) => {
        modal.instance.hide(); // Hide the modal
      });
    }
  }

  closeAll() {
    this.modals.forEach((modal) => {
      modal.instance.hide(); // Hide the modal
    });

    // Remove any lingering modal-backdrop elements
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.parentNode?.removeChild(backdrop);
    });
  }

  openPromptModal(params: {
    header: string;
    description: string;
    confirmText?: any,
    confirm?: any
  }) {
    let modalElement = document.querySelector(MODAL_TYPE.PROMPT);
    modalElement.querySelector(".modal-title").innerHTML = params.header;
    modalElement.querySelector(".modal-desc").innerHTML = params.description;
    modalElement.querySelector(".modal-confirm").innerHTML = params.confirmText;
    const confirm = modalElement.querySelector(".modal-confirm");
    const newButton = confirm.cloneNode(true);
    modalElement.querySelector(".modal-confirm").replaceWith(newButton);
    modalElement.querySelector(".modal-confirm").addEventListener("click", params.confirm);
    if (this.modals.some(x => x.name === MODAL_TYPE.PROMPT)) {
      this.modals.find(x => x.name === MODAL_TYPE.PROMPT).instance.show();
    } else {
      modalElement.querySelector(".modal-confirm").addEventListener("click", params.confirm);
      modalElement.querySelector(".modal-close").addEventListener("click", () => {
        modalInstance.hide();
      });

      const modalInstance = new Modal(modalElement);
      modalInstance.show();
      this.modals.push({
        name: MODAL_TYPE.PROMPT,
        instance: modalInstance,
      });
    }
  }
}
