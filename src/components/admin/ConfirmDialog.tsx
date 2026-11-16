'use client';

import React from 'react';
import { M3Icon } from '../m3/MaterialWebLoader';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'O‘chirish',
  cancelText = 'Bekor qilish',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-[#e0e2ec]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${
              isDestructive
                ? 'bg-rose-100 text-rose-700'
                : 'bg-[#d3e3fd] text-[#041e49]'
            }`}
          >
            <M3Icon
              name={isDestructive ? 'delete_forever' : 'info'}
              className="text-[26px]"
            />
          </div>

          <h3 className="text-base font-semibold text-[#1f1f1f]">
            {title}
          </h3>

          <p className="mt-2 text-sm text-[#444746] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="h-10 px-4 rounded-full text-xs sm:text-sm font-semibold text-[#444746] hover:bg-[#f3f6fc] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center h-10 px-5 rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-[#0b57d0] text-white hover:bg-[#0842a0]'
            }`}
          >
            {isLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
