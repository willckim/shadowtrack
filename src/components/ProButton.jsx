import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // or your own dialog logic
import { Button } from "@/components/ui/button"; // if you're using a UI lib like ShadCN

export default function ProButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow"
      >
        🚀 Pro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="text-center max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Pro Features Coming Soon</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Exporting, analytics, themes, and more — built to supercharge your shadowing logs.
          </p>
          <Button onClick={() => setOpen(false)} className="mt-4 w-full">
            Okay!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
