"use client"

import { useSearchParams } from "next/navigation"
import Layout from "@/components/kokonutui/layout"
import PersonalSettings from "@/app/settings/components/personal-settings"
import AccountSettings from "@/app/settings/components/account-settings"
import BillingSettings from "@/app/settings/components/billing-settings"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const section = searchParams?.get("section") || "personal"

  const renderContent = () => {
    switch (section) {
      case "account":
        return <AccountSettings />
      case "billing":
        return <BillingSettings />
      default:
        return <PersonalSettings />
    }
  }

  return (
    <Layout>
      <div className="p-6">{renderContent()}</div>
    </Layout>
  )
}
