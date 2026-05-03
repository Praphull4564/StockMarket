'use client';

import { Trash2 } from "lucide-react";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteAlertBtn({ alertId }: { alertId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteAlert(alertId);
    if (result.success) {
      toast.success("Alert deleted successfully");
      router.refresh();
    } else {
      toast.error("Failed to delete alert");
    }
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isLoading}
      className="p-1.5 alert-delete-btn hover:text-red-500 disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
