import React from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/drawer";

type DeleteInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  pending?: boolean;
};

const DeleteInvoiceModal = ({
  open,
  onOpenChange,
  onDelete,
  pending,
}: DeleteInvoiceDialogProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleDelete = () => {
    if (pending) return;
    onDelete();
  };
  const handleCancel = () => onOpenChange(false);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice</DialogTitle>
            <DialogDescription className="sm:max-w-4/5 mt-7">
              Strong Warning!!! This action is permanent. Once deleted, invoices
              cannot be restored. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              variant="outline"
              className="w-full max-w-60 mx-auto mt-5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              isLoading={pending}
              className="w-full max-w-60 mx-auto mt-5"
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Delete Invoice</DrawerTitle>
          <DrawerDescription>
            Strong Warning This action is permanent. Once deleted, invoices
            cannot be restored. Are you sure you want to continue?
          </DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="mt-2 pb-10">
          <div className="flex justify-center gap-6">
            <Button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              variant="outline"
              className="in-app-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              className="in-app-btn"
              isLoading={pending}
              variant='destructive'
            >
              Delete
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DeleteInvoiceModal;
