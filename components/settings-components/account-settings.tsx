"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Key, Settings, User, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { selectPlanName, selectUserInfo } from "@/store/slices/userSlice";

export default function AccountSettings() {
  const [saveLoading, setSaveLoading] = useState(false);
  const planName = useSelector(selectPlanName);
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
              Manage your account information and security settings
            </p>
          </div>
        </div>
        <PersonalInformationSection
          saveLoading={saveLoading}
          onSave={handleSavePersonalInfo}
          userInfo={userInfo}
        />
        <AccountStatusSection planName={planName} />
        <SecuritySection />
      </div>
    </div>
  );
}

// Account Status Section Component
function AccountStatusSection({ planName }: { planName: string }) {
  return (
    <Card className="mb-8 p-0">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Account Status
          </h2>
          <p className="text-muted-foreground text-sm">
            Your current account information
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Account Status</Label>
              <p className="text-sm text-muted-foreground">
                Your account is currently active
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Account Type</Label>
              <p className="text-sm text-muted-foreground">
                Professional Account
              </p>
            </div>
            <Badge variant="secondary">
              <Settings className="h-3 w-3 mr-1" />
              {planName}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
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
  const firstName = userInfo?.username?.split(" ")[0] || "";
  const lastName = userInfo?.username?.split(" ").slice(1).join(" ") || "";
  const email = userInfo?.email || "";

  return (
    <Card className="mb-8 p-0">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-muted-foreground text-sm">
            Update your personal details
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First Name
              </Label>
              <Input id="firstName" defaultValue={firstName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Last Name
              </Label>
              <Input id="lastName" defaultValue={lastName} disabled />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input id="email" type="email" defaultValue={email} disabled />
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

// Security Section Component
function SecuritySection() {
  return (
    <Card className="p-0">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-muted-foreground text-sm">
            Manage your account security settings
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed 3 months ago
              </p>
            </div>
            <Button variant="outline">
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
