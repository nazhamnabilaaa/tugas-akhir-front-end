import * as React from "react";
import {
  Dialog as RadixDialog,
  DialogContent,
  DialogTrigger,
} from "@radix-ui/react-dialog";

export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <RadixDialog open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-4 py-2">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="p-4 bg-white rounded-md shadow-lg">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t px-4 py-2">{children}</div>;
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  return <DialogTrigger asChild>{children}</DialogTrigger>;
}
