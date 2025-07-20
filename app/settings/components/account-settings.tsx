"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Shield, Key, Info } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  tooltip,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  tooltip?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5 flex items-center gap-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function AccountSettings() {
  // Controlled state for switches
  const [profileVisible, setProfileVisible] = useState(true)
  const [activityStatus, setActivityStatus] = useState(true)
  const [dataCollection, setDataCollection] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Handlers for switches
  const handleSwitch = (setter: (v: boolean) => void, label: string) => (checked: boolean) => {
    setter(checked)
    toast({
      title: `${label} ${checked ? "enabled" : "disabled"}`,
      description: `Your preference for ${label.toLowerCase()} has been updated.`,
    })
  }

  // Handler for delete account
  const handleDelete = async () => {
    setDeleteLoading(true)
    await new Promise((res) => setTimeout(res, 1200)) // Simulate async
    setDeleteLoading(false)
    toast({
      title: "Account Deleted",
      description: "Your account has been deleted. (UI only)",
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold">Account Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your account preferences and settings.</p>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Account Status</CardTitle>
          <CardDescription className="text-xs">Your current account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Account Status</Label>
              <p className="text-xs text-muted-foreground">Your account is currently active</p>
            </div>
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs px-2 py-0.5">Active</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Account Type</Label>
              <p className="text-xs text-muted-foreground">Professional Account</p>
            </div>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">Pro</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Privacy Settings</CardTitle>
          <CardDescription className="text-xs">Control your privacy and visibility settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SwitchRow
            id="profile-visibility"
            label="Profile Visibility"
            description="Make your profile visible to other users"
            checked={profileVisible}
            onCheckedChange={handleSwitch(setProfileVisible, "Profile Visibility")}
            tooltip="If disabled, your profile will be hidden from other users."
          />
          <p className="text-xs text-muted-foreground ml-1 mb-1">Make your profile visible to other users</p>
          <Separator />
          <SwitchRow
            id="activity-status"
            label="Activity Status"
            description="Show when you're online"
            checked={activityStatus}
            onCheckedChange={handleSwitch(setActivityStatus, "Activity Status")}
            tooltip="If disabled, your online status will not be shown."
          />
          <p className="text-xs text-muted-foreground ml-1 mb-1">Show when you're online</p>
          <Separator />
          <SwitchRow
            id="data-collection"
            label="Data Collection"
            description="Allow analytics and usage data collection"
            checked={dataCollection}
            onCheckedChange={handleSwitch(setDataCollection, "Data Collection")}
            tooltip="Help us improve by allowing anonymous analytics."
          />
          <p className="text-xs text-muted-foreground ml-1">Allow analytics and usage data collection</p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Security</CardTitle>
          <CardDescription className="text-xs">Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-1">
              <Label className="text-sm font-medium">Password</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-xs">Change your password regularly for better security.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" className="text-xs px-3 py-1 h-8"> <Key className="mr-2 h-3.5 w-3.5" />Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-1">
              <Label className="text-sm font-medium">Two-Factor Authentication</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-xs">Add an extra layer of security to your account.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 text-xs px-2 py-0.5">Enabled</Badge>
              <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-8">Configure</Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-1">
              <Label className="text-sm font-medium">Active Sessions</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-xs">View and manage devices logged into your account.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">Manage devices logged into your account</p>
            </div>
            <Button variant="outline" className="text-xs px-3 py-1 h-8"><Shield className="mr-2 h-3.5 w-3.5" />View Sessions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
          <CardDescription className="text-xs">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Delete Account</Label>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={deleteLoading} className="text-xs px-3 py-1 h-8">
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialogTrigger>
            </div>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-semibold">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading} className="text-xs px-3 py-1 h-8">Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="text-xs px-3 py-1 h-8"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
