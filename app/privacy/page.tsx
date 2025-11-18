import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { TncHeader } from "@/components/tnc/tnc-header";
import COMPANY_DATA from "@/lib/conpany-config";

// Company configuration - easily changeable
const COMPANY_CONFIG = {
  name: COMPANY_DATA.name,
  displayName: COMPANY_DATA.displayName,
  supportEmail: COMPANY_DATA.supportEmail,
  appName: COMPANY_DATA.name,
  description: COMPANY_DATA.description,
  jurisdiction: "New Delhi, India",
  arbitrationBody: "New Delhi, India",
  lastUpdated: "August, 2025",
} as const;

export const metadata = {
  title: `Privacy Policy | ${COMPANY_CONFIG.name}`,
  description: `Read the Privacy Policy that governs how ${COMPANY_CONFIG.name} collects, uses, and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <TncHeader />
      <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: {COMPANY_CONFIG.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Important Information
              </h2>
              <p>
                At {COMPANY_CONFIG.name} ("{COMPANY_CONFIG.name}", "we", "us",
                or "our"), we are committed to protecting your privacy and
                ensuring the security of your personal information. This Privacy
                Policy explains how we collect, use, disclose, and protect your
                information when you use our {COMPANY_CONFIG.description} ("
                {COMPANY_CONFIG.appName}" or "Services").
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                1. Your Data, Your Control
              </h2>
              <p className="mt-2">
                We believe in transparency and giving you control over your
                data. We will never sell your personal information to third
                parties. We will only use your information as described in this
                Privacy Policy and with your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                2. What Information We Collect
              </h2>
              <p className="mt-2">
                We collect information from you in a few ways:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-foreground">
                    Information You Provide:
                  </span>{" "}
                  When you create an account, use the {COMPANY_CONFIG.appName},
                  or contact us, you may provide us with personal information
                  such as your name, email address, phone number, company name,
                  and other relevant details.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Usage Data:
                  </span>{" "}
                  We collect information about how you use the{" "}
                  {COMPANY_CONFIG.appName}, such as the features you access, the
                  content you interact with, and the time you spend on the app.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Device Information:
                  </span>{" "}
                  We collect information about your device, such as your device
                  type, operating system, and unique device identifiers.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Location Data:
                  </span>{" "}
                  If you enable location services on your device, we may collect
                  your location data to provide you with relevant features and
                  services.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                3. How We Use Your Information
              </h2>
              <p className="mt-2">We use the information we collect to:</p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-foreground">
                    Provide and improve the {COMPANY_CONFIG.appName}:
                  </span>{" "}
                  We use your information to operate, maintain, and improve the{" "}
                  {COMPANY_CONFIG.appName}, including providing you with the
                  features and services you request.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Personalize your experience:
                  </span>{" "}
                  We use your information to personalize your experience with
                  the {COMPANY_CONFIG.appName}, such as by showing you relevant
                  content and recommendations.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Communicate with you:
                  </span>{" "}
                  We use your information to communicate with you about the{" "}
                  {COMPANY_CONFIG.appName}, including sending you updates,
                  notifications, and marketing messages.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Analyze and understand usage:
                  </span>{" "}
                  We use your information to analyze and understand how users
                  interact with the {COMPANY_CONFIG.appName}, so we can improve
                  it.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Prevent fraud and abuse:
                  </span>{" "}
                  We use your information to prevent fraud and abuse of the{" "}
                  {COMPANY_CONFIG.appName}.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                4. Sharing Your Information
              </h2>
              <p className="mt-2">We may share your information with:</p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-foreground">
                    Service Providers:
                  </span>{" "}
                  We may share your information with third-party service
                  providers who help us operate, maintain, and improve the{" "}
                  {COMPANY_CONFIG.appName}. These service providers are
                  obligated to protect your information in accordance with our
                  instructions and applicable privacy laws.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Legal Requirements:
                  </span>{" "}
                  We may disclose your information if required by law,
                  regulation, or legal process, or to protect the rights,
                  property, or safety of {COMPANY_CONFIG.name}, our users, or
                  others.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                5. Your Privacy Rights
              </h2>
              <p className="mt-2">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-foreground">Access:</span>{" "}
                  You can request access to the personal information we hold
                  about you.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Correction:
                  </span>{" "}
                  You can request that we correct any inaccurate or incomplete
                  personal information we hold about you.
                </li>
                <li>
                  <span className="font-medium text-foreground">Deletion:</span>{" "}
                  You can request that we delete your personal information,
                  subject to certain exceptions.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Restriction:
                  </span>{" "}
                  You can request that we restrict the processing of your
                  personal information.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Portability:
                  </span>{" "}
                  You can request that we provide you with a copy of your
                  personal information in a portable format.
                </li>
                <li>
                  <span className="font-medium text-foreground">Opt-out:</span>{" "}
                  You can opt-out of receiving marketing communications from us.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                6. Security
              </h2>
              <p className="mt-2">
                We take reasonable measures to protect your personal information
                from unauthorized access, use, disclosure, alteration, or
                destruction. However, no website or online service can guarantee
                complete security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                7. Children's Privacy
              </h2>
              <p className="mt-2">
                The {COMPANY_CONFIG.appName} is not intended for children under
                13 years of age. We do not knowingly collect personal
                information from children under 13. If you are a parent or
                guardian and you believe that your child has provided us with
                personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                8. Changes to this Privacy Policy
              </h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by posting the updated
                Privacy Policy on the {COMPANY_CONFIG.appName}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                9. Contact Us
              </h2>
              <p className="mt-2">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="mt-2">Email: {COMPANY_CONFIG.supportEmail}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                10. Governing Law
              </h2>
              <p className="mt-2">
                This Privacy Policy is governed by and construed in accordance
                with the laws of {COMPANY_CONFIG.jurisdiction}, without regard
                to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                11. Dispute Resolution
              </h2>
              <p className="mt-2">
                Any dispute arising out of or relating to this Privacy Policy
                shall be resolved through binding arbitration in accordance with
                the rules of the {COMPANY_CONFIG.arbitrationBody}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                12. Entire Agreement
              </h2>
              <p className="mt-2">
                This Privacy Policy constitutes the entire agreement between you
                and {COMPANY_CONFIG.name} regarding your personal information
                and supersedes all prior or contemporaneous communications and
                proposals, whether oral or written.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Final Note
              </h2>
              <p className="mt-2">
                By using {COMPANY_CONFIG.name}, you acknowledge that you have
                read, understood, and agree to the collection, use, and
                disclosure of your information as described in this Privacy
                Policy. If you do not agree to this Privacy Policy, you should
                not use our Services.
              </p>
              <p className="mt-4">
                For any questions or concerns regarding this Privacy Policy,
                please contact us at {COMPANY_CONFIG.supportEmail}.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
