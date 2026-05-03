'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createAlert } from "@/lib/actions/alert.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PriceAlertModal({ 
  symbol = "", 
  company = "", 
  variant = "link" 
}: { 
  symbol?: string; 
  company?: string;
  variant?: "link" | "btn" 
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      symbol: (formData.get("symbol") as string).toUpperCase(),
      type: formData.get("type") as string,
      condition: formData.get("condition") as string,
      targetPrice: Number(formData.get("targetPrice")),
      frequency: formData.get("frequency") as string,
    };

    const result = await createAlert(data);

    if (result.success) {
      toast.success("Alert created successfully");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Failed to create alert");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "btn" ? (
          <button className="search-btn !px-4 !py-2 text-sm !bg-yellow-500 text-black rounded font-medium">
            Create Alert
          </button>
        ) : (
          <button className="add-alert">
            Add Alert
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] !bg-[#1A1C20] !border-[#30333A] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Price Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Alert Name</label>
            <Input 
              name="name" 
              required 
              placeholder="e.g. Apple at Discount" 
              defaultValue={company ? `${company} Alert` : ""}
              className="!bg-[#212328] !border-[#30333A] focus:!border-[#E8BA40]" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Stock identifier</label>
            <Input 
              name="symbol" 
              required 
              placeholder="e.g. AAPL" 
              defaultValue={symbol}
              className="!bg-[#212328] !border-[#30333A] focus:!border-[#E8BA40]" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Alert type</label>
            <select 
              name="type" 
              className="w-full h-10 px-3 rounded-md !bg-[#212328] border border-[#30333A] text-sm focus:border-[#E8BA40] outline-none"
              defaultValue="Price"
            >
              <option value="Price">Price</option>
              <option value="Volume">Volume</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Condition</label>
            <select 
              name="condition" 
              className="w-full h-10 px-3 rounded-md !bg-[#212328] border border-[#30333A] text-sm focus:border-[#E8BA40] outline-none"
            >
              <option value="greater_than">Greater than {'>'}</option>
              <option value="less_than">Less than {'<'}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400">Threshold value</label>
            <Input 
              name="targetPrice" 
              type="number" 
              step="0.01" 
              required 
              placeholder="$ eg: 140" 
              className="!bg-[#212328] !border-[#30333A] focus:!border-[#E8BA40]" 
            />
          </div>

          <div className="space-y-1.5 mb-2">
            <label className="text-sm font-medium text-gray-400">Frequency</label>
            <select 
              name="frequency" 
              className="w-full h-10 px-3 rounded-md !bg-[#212328] border border-[#30333A] text-sm focus:border-[#E8BA40] outline-none"
            >
              <option value="Once per day">Once per day</option>
              <option value="Once per hour">Once per hour</option>
              <option value="Once per minute">Once per minute</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 bg-[#E8BA40] text-black font-semibold rounded-md hover:bg-[#FDD458] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Alert"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
