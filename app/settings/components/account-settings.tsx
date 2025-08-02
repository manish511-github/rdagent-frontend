"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Shield, Key, Info, CheckCircle, Lock, Settings, AlertTriangle } from "lucide-react"
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
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-[1400px]">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-2xl font-semibold">Account Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        {/* Account Status */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Account Status
              </h2>
              <p className="text-muted-foreground text-sm">Your current account information</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Account Status</Label>
                  <p className="text-sm text-muted-foreground">Your account is currently active</p>
                </div>
                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <p className="text-sm text-muted-foreground">Professional Account</p>
                </div>
                <Badge variant="secondary">
                  <Settings className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </h2>
              <p className="text-muted-foreground text-sm">Control your privacy and visibility settings</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  id="profile-visibility"
                  checked={profileVisible}
                  onCheckedChange={handleSwitch(setProfileVisible, "Profile Visibility")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Activity Status</Label>
                  <p className="text-sm text-muted-foreground">Show when you're online</p>
                </div>
                <Switch
                  id="activity-status"
                  checked={activityStatus}
                  onCheckedChange={handleSwitch(setActivityStatus, "Activity Status")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow analytics and usage data collection</p>
                </div>
                <Switch
                  id="data-collection"
                  checked={dataCollection}
                  onCheckedChange={handleSwitch(setDataCollection, "Data Collection")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8 p-0">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </h2>
              <p className="text-muted-foreground text-sm">Manage your account security settings</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Password</Label>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">Manage devices logged into your account</p>
                </div>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  View Sessions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="p-0 border-destructive/50">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h2>
              <p className="text-muted-foreground text-sm">Irreversible and destructive actions</p>
            </div>
            
            <AlertDialog>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleteLoading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
              </div>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteLoading}
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
    </div>
  )
}
