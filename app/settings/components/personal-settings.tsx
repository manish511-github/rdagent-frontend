"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { RootState, AppDispatch } from "@/store/store"

export function PersonalSettings() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const dispatch = useDispatch<AppDispatch>()

  // Get user data from Redux
  const { info: userInfo } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username || "")
      setEmail(userInfo.email || "")
      setBio(userInfo.bio || "")
      setProfileImage(userInfo.profile_image || "")
    }
  }, [userInfo])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement API call to update user profile
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implement actual file upload
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt={username} />
                <AvatarFallback className="text-lg">{getInitials(username || email)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">Change Photo</span>
                  </div>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Brief description for your profile. Max 160 characters.</p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account ID</Label>
                <p className="text-sm">{userInfo?.id}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p className="text-sm">
                  {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                <p className="text-sm">{userInfo?.is_active ? "Active" : "Inactive"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email Verified</Label>
                <p className="text-sm">{userInfo?.verified_at ? "Verified" : "Not Verified"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
