// components/notes/editor/utils/confirmDialogUtils.ts
"use client";

import { useState } from "react";

export type ConfirmDialogVariant = "danger" | "default";

export type ConfirmDialogState = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel?: () => void;
} | null;

export type OpenConfirmDialogArgs = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function useConfirmDialog() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);

  function openConfirmDialog({
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = "default",
    onConfirm,
    onCancel,
  }: OpenConfirmDialogArgs) {
    setConfirmDialog({
      title,
      message,
      confirmLabel,
      cancelLabel,
      variant,
      onConfirm,
      onCancel,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog(null);
  }

  function confirm() {
    confirmDialog?.onConfirm();
    setConfirmDialog(null);
  }

  function cancel() {
    confirmDialog?.onCancel?.();
    setConfirmDialog(null);
  }

  return {
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    confirm,
    cancel,
  };
}
