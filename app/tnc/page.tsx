import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { TncHeader } from "@/components/tnc/tnc-header";
import COMPANY_DATA from "@/lib/conpany-config";

// Company configuration - easily changeable
const COMPANY_CONFIG = {
  name: COMPANY_DATA.name,
  displayName: COMPANY_DATA.displayName,
  supportEmail: COMPANY_DATA.supportEmail,
  description: COMPANY_DATA.description,
  serviceDescription:
    "an AI-powered growth hacking tool designed to help businesses optimize their marketing strategies",
  jurisdiction: "the jurisdiction in which Zooptics operates",
  arbitrationBody: 'American Arbitration Association ("AAA")',
  lastUpdated: "August, 2025",
} as const;

export const metadata = {
  title: `Terms of Service | ${COMPANY_CONFIG.name}`,
  description: `Read the Terms of Service that govern your use of ${COMPANY_CONFIG.name}.`,
};

export default function TermsOfServicePage() {
  return (
    <>
      <TncHeader />
      <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: {COMPANY_CONFIG.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
            <section>
              <p>
                Welcome to {COMPANY_CONFIG.displayName},{" "}
                {COMPANY_CONFIG.description}. By accessing or using our
                services, you agree to comply with and be bound by the following
                terms and conditions. Please read them carefully.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="mt-2">
                By using {COMPANY_CONFIG.name} (the "Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you do not agree
                to these Terms, you may not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p className="mt-2">
                {COMPANY_CONFIG.name} is {COMPANY_CONFIG.serviceDescription}.
                The Service includes, but is not limited to, software, tools,
                and other resources made available via {COMPANY_CONFIG.name}.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                3. Eligibility
              </h2>
              <p className="mt-2">
                You must be at least 18 years old to use the Service. By using
                the Service, you represent and warrant that you are 18 years of
                age or older and have the legal capacity to enter into these
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                4. Account Registration
              </h2>
              <p className="mt-2">
                You may need to create an account to use certain features of the
                Service. When creating your account, you must provide accurate
                and complete information. You are responsible for maintaining
                the confidentiality of your account credentials and for all
                activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                5. User Conduct
              </h2>
              <p className="mt-2">
                You agree not to use the Service for any unlawful or prohibited
                activities, including but not limited to:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Violating any applicable laws or regulations.</li>
                <li>
                  Infringing on the intellectual property rights of others.
                </li>
                <li>
                  Distributing harmful software or engaging in any malicious
                  activities.
                </li>
                <li>
                  Impersonating any person or entity, or falsely stating or
                  otherwise misrepresenting your affiliation with a person or
                  entity.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                6. Privacy Policy
              </h2>
              <p className="mt-2">
                Your use of the Service is also governed by our Privacy Policy,
                which is incorporated by reference into these Terms. Please
                review our Privacy Policy to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                7. Intellectual Property
              </h2>
              <p className="mt-2">
                All content and materials available on the Service, including
                but not limited to text, graphics, logos, and software, are the
                property of {COMPANY_CONFIG.name} or its licensors and are
                protected by intellectual property laws. You may not use,
                reproduce, or distribute any content from the Service without
                our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                8. Subscription and Payment
              </h2>
              <p className="mt-2">
                Certain features of the Service may require a subscription. By
                subscribing, you agree to pay all applicable fees. We reserve
                the right to change our subscription plans or adjust pricing at
                any time. Any changes will be communicated to you in advance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                9. Termination
              </h2>
              <p className="mt-2">
                We may terminate or suspend your access to the Service at any
                time, without prior notice or liability, for any reason,
                including but not limited to your breach of these Terms. Upon
                termination, your right to use the Service will immediately
                cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                10. Limitation of Liability
              </h2>
              <p className="mt-2">
                To the maximum extent permitted by law, {COMPANY_CONFIG.name}{" "}
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or
                revenues, whether incurred directly or indirectly, or any loss
                of data, use, goodwill, or other intangible losses, resulting
                from:
              </p>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>Your use or inability to use the Service.</li>
                <li>
                  Any unauthorized access to or use of our servers and/or any
                  personal information stored therein.
                </li>
                <li>
                  Any bugs, viruses, or other harmful code that may be
                  transmitted to or through the Service by any third party.
                </li>
                <li>
                  Any errors or omissions in any content or for any loss or
                  damage incurred as a result of your use of any content posted,
                  emailed, transmitted, or otherwise made available through the
                  Service.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                11. Indemnification
              </h2>
              <p className="mt-2">
                You agree to indemnify, defend, and hold harmless{" "}
                {COMPANY_CONFIG.name}, its affiliates, and their respective
                officers, directors, employees, and agents from and against any
                and all claims, liabilities, damages, losses, costs, expenses,
                or fees arising from your use of the Service or your violation
                of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                12. Governing Law
              </h2>
              <p className="mt-2">
                These Terms shall be governed by and construed in accordance
                with the laws of {COMPANY_CONFIG.jurisdiction}, without regard
                to its conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                13. Changes to Terms
              </h2>
              <p className="mt-2">
                We reserve the right to modify these Terms at any time. Any
                changes will be effective immediately upon posting the revised
                Terms on the Service. Your continued use of the Service after
                the posting of the revised Terms constitutes your acceptance of
                the changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                14. Contact Information
              </h2>
              <p className="mt-2">
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p className="mt-2">Email: {COMPANY_CONFIG.supportEmail}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                15. Miscellaneous
              </h2>
              <ul className="mt-2 list-disc pl-6 space-y-1">
                <li>
                  <span className="font-medium text-foreground">
                    Entire Agreement:
                  </span>{" "}
                  These Terms constitute the entire agreement between you and{" "}
                  {COMPANY_CONFIG.name} regarding the use of the Service.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Waiver and Severability:
                  </span>{" "}
                  Our failure to enforce any right or provision of these Terms
                  will not be considered a waiver of those rights. If any
                  provision of these Terms is held to be invalid or
                  unenforceable, the remaining provisions will remain in effect.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Assignment:
                  </span>{" "}
                  You may not assign or transfer these Terms, or any rights or
                  obligations hereunder, without our prior written consent. We
                  may assign these Terms without restriction.
                </li>
                <li>
                  <span className="font-medium text-foreground">Notices:</span>{" "}
                  Any notices or other communications provided by{" "}
                  {COMPANY_CONFIG.name} under these Terms, including those
                  regarding modifications to these Terms, will be given: (i) via
                  email; or (ii) by posting to the Service. For notices made by
                  email, the date of receipt will be deemed the date on which
                  such notice is transmitted.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Force Majeure:
                  </span>{" "}
                  {COMPANY_CONFIG.name} will not be liable for any failure or
                  delay in performance due to causes beyond our reasonable
                  control, including but not limited to acts of God, war,
                  strikes, or other labor disputes, embargoes, government
                  orders, or any other force majeure event.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    No Third-Party Beneficiaries:
                  </span>{" "}
                  These Terms do not confer any third-party beneficiary rights.
                </li>
                <li>
                  <span className="font-medium text-foreground">Headings:</span>{" "}
                  The headings in these Terms are for convenience only and have
                  no legal or contractual effect.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                16. Beta Services
              </h2>
              <p className="mt-2">
                From time to time, {COMPANY_CONFIG.name} may invite you to try,
                at no charge, products or services that are in beta or
                pre-release stages ("Beta Services"). You may accept or decline
                any such trial in your sole discretion. Beta Services are
                provided "as-is" without any warranties, and they may be subject
                to additional terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                17. Feedback
              </h2>
              <p className="mt-2">
                We welcome and encourage you to provide feedback, comments, and
                suggestions for improvements to the Service ("Feedback"). You
                may submit Feedback by emailing us at{" "}
                {COMPANY_CONFIG.supportEmail}. You acknowledge and agree that
                all Feedback will be the sole and exclusive property of{" "}
                {COMPANY_CONFIG.name}, and you hereby irrevocably assign to{" "}
                {COMPANY_CONFIG.name} all of your rights, title, and interest in
                and to all Feedback.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                18. Dispute Resolution
              </h2>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Informal Resolution:
                </span>{" "}
                Before filing any claim against {COMPANY_CONFIG.name}, you agree
                to try to resolve the dispute informally by contacting us at{" "}
                {COMPANY_CONFIG.supportEmail}. We'll try to resolve the dispute
                informally by contacting you via email. If a dispute is not
                resolved within 30 days of submission, either party may bring
                formal proceedings.
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Arbitration Agreement:
                </span>{" "}
                For any dispute you have with {COMPANY_CONFIG.name}, you agree
                to first contact us and attempt to resolve the dispute with us
                informally. If {COMPANY_CONFIG.name} has not been able to
                resolve the dispute with you informally, we each agree to
                resolve any claim, dispute, or controversy (excluding claims for
                injunctive or other equitable relief) arising out of or in
                connection with or relating to these Terms by binding
                arbitration by the {COMPANY_CONFIG.arbitrationBody} under the
                Commercial Arbitration Rules and Supplementary Procedures for
                Consumer Related Disputes then in effect for the AAA, except as
                provided herein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                19. Electronic Communications
              </h2>
              <p className="mt-2">
                By using the Service, you consent to receiving electronic
                communications from us. These communications may include notices
                about your account and information concerning or related to the
                Service. You agree that any notices, agreements, disclosures, or
                other communications that we send to you electronically will
                satisfy any legal communication requirements, including that
                such communications be in writing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                20. International Use
              </h2>
              <p className="mt-2">
                {COMPANY_CONFIG.name} makes no representation that the Service
                is appropriate or available for use in locations outside of{" "}
                {COMPANY_CONFIG.jurisdiction}. If you access the Service from
                other locations, you do so at your own initiative and are
                responsible for compliance with local laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                21. Third-Party Links
              </h2>
              <p className="mt-2">
                The Service may contain links to third-party websites or
                services that are not owned or controlled by{" "}
                {COMPANY_CONFIG.name}. We have no control over, and assume no
                responsibility for, the content, privacy policies, or practices
                of any third-party websites or services. You acknowledge and
                agree that {COMPANY_CONFIG.name} shall not be responsible or
                liable, directly or indirectly, for any damage or loss caused or
                alleged to be caused by or in connection with the use of or
                reliance on any such content, goods, or services available on or
                through any such websites or services.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                22. Third Party Data Responsibility and Compliance
              </h2>
              <p className="mt-2">
                {COMPANY_CONFIG.name} takes full responsibility for all data
                collected, processed, or displayed through the Service. The
                Service only accesses publicly available data and does not
                retrieve or display content that is behind login walls or
                restricted access areas.
                {COMPANY_CONFIG.name} will respond promptly to any data subject
                requests, including requests for access, correction, or deletion
                of personal data, in accordance with applicable data protection
                and privacy laws.
              </p>
            </section>
            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Final Acknowledgment
              </h2>
              <p className="mt-2">
                By using {COMPANY_CONFIG.name}, you acknowledge that you have
                read, understood, and agree to be bound by these Terms of
                Service. If you do not agree to these Terms, you should not use
                our Service.
              </p>
              <p className="mt-4">
                For any questions or concerns regarding these Terms, please
                contact us at {COMPANY_CONFIG.supportEmail}.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
