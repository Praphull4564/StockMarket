'use client';

import { Trash2 } from "lucide-react";
import { removeWatchlistItem } from "@/lib/actions/watchlist.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function RemoveWatchlistBtn({ symbol }: { symbol: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async () => {
    setIsLoading(true);
    const result = await removeWatchlistItem(symbol);
    if (result.success) {
      toast.success(`Removed ${symbol} from watchlist`);
      router.refresh();
    } else {
      toast.error("Failed to remove from watchlist");
    }
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={isLoading}
      className="p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors disabled:opacity-50"
      title="Remove from watchlist"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
