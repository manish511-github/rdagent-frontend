import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { TncHeader } from "@/components/tnc/tnc-header";

// Company configuration - easily changeable
const COMPANY_CONFIG = {
  name: "Zooptics",
  displayName: "Zooptics.com",
  supportEmail: "contact@Zooptics.com",
  description: "an AI marketing automation application",
  lastUpdated: "August, 2025",
} as const;

export const metadata = {
  title: `Refund Policy | ${COMPANY_CONFIG.name}`,
  description: `Read the Refund Policy for ${COMPANY_CONFIG.name} and understand our refund terms and conditions.`,
};

export default function RefundPolicyPage() {
  return (
    <>
      <TncHeader />
      <main className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Refund Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last Updated: {COMPANY_CONFIG.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
            <section>
              <p>
                At {COMPANY_CONFIG.name}, we prioritize delivering excellence in
                every aspect of our service. Due to the digital format of our
                product, we regret to inform you that refunds cannot be issued
                once a purchase has been completed. However, please be assured
                that our commitment to your satisfaction remains steadfast.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                1. No Refund Policy
              </h2>
              <p className="mt-2">
                Due to the digital nature of our {COMPANY_CONFIG.description},
                all sales are final. Once a purchase has been completed and
                access to our platform has been granted, refunds cannot be
                issued. This policy is in place due to the immediate delivery
                and accessibility of our digital services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                2. Technical Support and Assistance
              </h2>
              <p className="mt-2">
                In the event of any technical issues or specific requirements,
                we are fully equipped and dedicated to swiftly addressing them.
                Our team is committed to ensuring that your experience with{" "}
                {COMPANY_CONFIG.name} is nothing short of exceptional.
              </p>
              <p className="mt-2">
                We provide comprehensive technical support to resolve any issues
                you may encounter while using our services. Our support team
                works diligently to ensure all technical problems are addressed
                promptly and effectively.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                3. Commitment to Excellence
              </h2>
              <p className="mt-2">
                Central to our ethos is the cultivation of a thriving community
                and fostering a culture of excellence. Your feedback is integral
                to our continuous improvement efforts, and we deeply appreciate
                your contribution to our shared journey.
              </p>
              <p className="mt-2">
                We are dedicated to maintaining the highest standards of service
                quality and continuously improving our platform based on user
                feedback and industry best practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                4. Service Quality Assurance
              </h2>
              <p className="mt-2">
                We stand behind the quality of our {COMPANY_CONFIG.description}{" "}
                and are committed to delivering value to our users. While
                refunds are not available, we ensure that:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>All services are delivered as described</li>
                <li>Technical issues are resolved promptly</li>
                <li>Customer support is readily available</li>
                <li>Continuous improvements are made based on user feedback</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                5. Alternative Solutions
              </h2>
              <p className="mt-2">
                While we cannot provide monetary refunds, we are committed to
                working with you to resolve any concerns or issues you may have.
                This may include:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2">
                <li>Technical troubleshooting and support</li>
                <li>Account adjustments or modifications</li>
                <li>Additional guidance and training</li>
                <li>Service credits in exceptional circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                6. Contact Information
              </h2>
              <p className="mt-2">
                Should you require any assistance or have further inquiries,
                please do not hesitate to contact us at{" "}
                {COMPANY_CONFIG.supportEmail}. We are here to ensure that your
                experience with {COMPANY_CONFIG.name} is both seamless and
                enriching.
              </p>
              <p className="mt-2">
                Our customer support team is available to address any questions,
                concerns, or technical issues you may encounter. We strive to
                respond to all inquiries promptly and provide comprehensive
                assistance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                7. Policy Updates
              </h2>
              <p className="mt-2">
                We reserve the right to update this Refund Policy at any time.
                Any changes will be posted on this page with an updated "Last
                Updated" date. We encourage you to review this policy
                periodically to stay informed about our refund terms.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold text-foreground">
                Final Note
              </h2>
              <p className="mt-2">
                Thank you for entrusting us with your development needs. By
                using {COMPANY_CONFIG.name}, you acknowledge that you have read,
                understood, and agree to this Refund Policy.
              </p>
              <p className="mt-4">
                We appreciate your understanding of our refund policy and look
                forward to providing you with exceptional service. For any
                questions or concerns regarding this policy, please contact us
                at {COMPANY_CONFIG.supportEmail}.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
