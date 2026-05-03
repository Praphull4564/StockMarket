'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any; // User type
}

const ProfileModal = ({ open, onOpenChange, user }: ProfileModalProps) => {
    const [name, setName] = useState(user.name || "");
    const [image, setImage] = useState(user.image || "");
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2MB");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const res = await updateProfile({ name, image });
            if (res.success) {
                toast.success("Profile updated successfully!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(res.error || "Failed to update profile.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 border-gray-700 text-gray-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Update your display name and profile picture.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-300">Name</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="bg-gray-700 border-gray-600 focus-visible:ring-yellow-500"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image" className="text-gray-300">Profile Image</Label>
                        <div className="flex flex-col gap-3">
                            <Input 
                                id="image-upload" 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="bg-gray-700 border-gray-600 focus-visible:ring-yellow-500 cursor-pointer file:text-gray-300 file:bg-gray-600 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-md hover:file:bg-gray-500"
                            />
                            {image && (
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-600">
                                        <img src={image} alt="Profile preview" className="h-full w-full object-cover" />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setImage("")}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-gray-700">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isUploading} className="bg-yellow-500 text-gray-900 hover:bg-yellow-600 font-semibold">
                            {isSubmitting ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ProfileModal;
