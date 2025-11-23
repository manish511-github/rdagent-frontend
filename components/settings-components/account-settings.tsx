"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { selectUserInfo } from "@/store/slices/userSlice";

export default function AccountSettings() {
  const [saveLoading, setSaveLoading] = useState(false);
  const userInfo = useSelector(selectUserInfo);

  // Handler for saving personal information
  const handleSavePersonalInfo = async () => {
    setSaveLoading(true);
    await new Promise((res) => setTimeout(res, 1200)); // Simulate async
    setSaveLoading(false);
    toast({
      title: "Personal Information Updated",
      description: "Your personal information has been saved successfully.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-semibold">Account Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account information
            </p>
          </div>
        </div>
        <PersonalInformationSection
          saveLoading={saveLoading}
          onSave={handleSavePersonalInfo}
          userInfo={userInfo}
        />
      </div>
    </div>
  );
}

// Personal Information Section Component
function PersonalInformationSection({
  saveLoading,
  onSave,
  userInfo,
}: {
  saveLoading: boolean;
  onSave: () => void;
  userInfo: any;
}) {
  // Extract user data from store
  const username = userInfo?.username || "";
  const email = userInfo?.email || "";

  return (
    <Card className="mb-8 p-0">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>
        </div>

        <div className="space-y-6">
          {/* Username and Email Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input id="username" defaultValue={username} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input id="email" type="email" defaultValue={email} disabled />
            </div>
          </div>

          {/* Save Button */}
          {/* <div className="flex justify-end pt-4 border-t">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onSave}
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}

