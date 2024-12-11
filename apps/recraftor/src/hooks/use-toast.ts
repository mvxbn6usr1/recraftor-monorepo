// Re-export the existing toast hook with better typing
import { useToast as useToastOriginal } from '@/components/ui/use-toast';
import type { ToastActionElement } from '@/components/ui/toast';

export interface ToastProps {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

export type Toast = (props: ToastProps) => void;

export const useToast = useToastOriginal;