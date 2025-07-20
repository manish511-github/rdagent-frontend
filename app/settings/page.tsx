"use client"

import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { RootState } from "@/store/store"
import Layout from "@/components/kokonutui/layout"

export default function PersonalSettings() {
  const { info: userInfo } = useSelector((state: RootState) => state.user)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personal Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-lg">
                  {userInfo?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
                <p className="text-sm text-muted-foreground mt-1">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={userInfo?.username || ""} placeholder="Enter your username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={userInfo?.email || ""} placeholder="Enter your email" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself..." className="min-h-[100px]" />
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {userInfo?.subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your current subscription details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <p className="text-sm text-muted-foreground capitalize">{userInfo.subscription.tier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-muted-foreground capitalize">{userInfo.subscription.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Started</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userInfo.subscription.starts_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ends</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(userInfo.subscription.ends_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
