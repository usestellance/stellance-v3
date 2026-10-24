"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/drawer";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { X } from "lucide-react";
import { useMediaQuery } from "@/lib/use-media-query";

type SendInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: { emails: string[] }) => void;
  pending?: boolean;
  defaultEmail: string;
};

const SendInvoiceDialog = ({
  open,
  onOpenChange,
  onSend,
  pending,
  defaultEmail,
}: SendInvoiceDialogProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [emails, setEmails] = useState<string[]>([defaultEmail]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // The payer's email arrives with the invoice; the preview remounts this dialog (key) when it does.
  const trimmedEmails = emails.filter((e) => e !== "");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (trimmedEmails.includes(trimmedEmail)) {
      setError("This email has already been added");
      return;
    }

    setEmails([...trimmedEmails, trimmedEmail]);
    setInputValue("");
    setError("");
  };

  const removeEmail = (emailToRemove: string) => {
    if (emailToRemove === defaultEmail) return;
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail(inputValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      trimmedEmails.length > 0
    ) {
      removeEmail(trimmedEmails[emails.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedEmails = pastedText.split(/[,;\s]+/).filter(Boolean);

    pastedEmails.forEach((email) => {
      const trimmedEmail = email.trim();
      if (validateEmail(trimmedEmail) && !emails.includes(trimmedEmail)) {
        setEmails((prev) => [...prev, trimmedEmail]);
      }
    });
    setInputValue("");
  };

  const handleSubmit = (skipMembers: boolean = false) => {
    if (inputValue.trim()) {
      addEmail(inputValue);
    }

    const emailsToSend = skipMembers ? [] : emails.filter((e) => e !== "");
    onSend({ emails: emailsToSend });

    console.log("Submitted emails:", emailsToSend);
    // Reset form
    setEmails([defaultEmail]);
    setInputValue("");
    setError("");
    onOpenChange(false);
  };
  const handleCancel = () => {
    // Reset form
    setEmails([]);
    setInputValue("");
    setError("");
    onOpenChange(false);
  };

  const emailInputContent = (
    <div>
      <Label className="sm:text-lg">Email Address(es)</Label>
      <div
        className="mt-2 min-h-[42px] w-full border-b border-primary-100 px-3 py-3 text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2 items-center mt-1">
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 bg-primary-50 rounded-[5px] px-2 py-1 text-sm font-medium lg:text-base"
            >
              {email}
              {email !== defaultEmail && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEmail(email);
                  }}
                  className="hover:bg-secondary-foreground/20 rounded-sm p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue.trim()) {
                addEmail(inputValue);
              }
            }}
            placeholder={
              emails.length === 0
                ? "e.g. client@email.com, finance@email.com"
                : ""
            }
            className="flex-1 min-w-fit outline-none bg-transparent"
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter, comma, or space to add email
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add members to this invoice</DialogTitle>
            <DialogDescription className="sm:max-w-4/5">
              Members added to this invoice will be able to follow up and add
              comments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {emailInputContent}

            <DialogFooter>
              <Button
                type="submit"
                // onClick={() => handleSubmit(true)}
                onClick={handleCancel}
                variant="outline"
                className="w-full max-w-60 mx-auto mt-5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={emails.length === 0}
                className="w-full max-w-60 mx-auto mt-5"
              >
                {emails.length === 1 ? "Send" : " Add & Send"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex flex-col max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add members to this invoice</DrawerTitle>
          <DrawerDescription>
            Members added to this invoice will be able to follow up and add
            comments.
          </DrawerDescription>
        </DrawerHeader>

        {/* Scrollable email list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
          {emailInputContent}
        </div>

        <DrawerFooter className="mt-2 pb-10">
          <div className="flex justify-center gap-6">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="in-app-btn"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={emails.length === 0}
              className="in-app-btn"
              isLoading={pending}
            >
              {emails.length === 1 ? "Send" : " Add & Send"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SendInvoiceDialog;
