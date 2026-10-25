import Image from "next/image";
import Link from "next/link";
import { APP_LINKS } from "@/lib/site";

const COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
    ],
  },
  {
    title: "Get Started",
    links: [
      { label: "Key benefits", href: "/#benefits" },
      { label: "Our vision", href: "/#vision" },
      { label: "Log in", href: APP_LINKS.signIn },
      { label: "Sign up", href: APP_LINKS.signUp },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-neutral-500 text-black-500 py-12 lg:pt-[60px] lg:pb-[44px]">
      <div className="landing-container">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex max-w-[439px] shrink flex-col gap-[15px] xl:px-[30px]">
            <Link href="/" className="flex items-center gap-1 w-fit">
              <Image src="/images/landing/footer-logo.png" alt="Stellance logo" width={90} height={77} className="h-[60px] w-auto lg:h-[74px]" />
              <span className="text-2xl lg:text-[32px]">Stellance</span>
            </Link>
            <p className="max-w-[325px] text-base tracking-[0.01em]">
              Invoicing and USDC payments on the Stellar network, with every payment verified against its invoice.
            </p>
            <div className="flex items-center gap-[22px]">
              <Link href="https://x.com/stellancehq?s=11" target="_blank" aria-label="Stellance on X">
                <Image src="/images/landing/social-x.svg" alt="" width={36} height={36} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:gap-x-14 xl:gap-x-24 2xl:gap-x-[180px]">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-[30px]">
                <h4 className="text-base uppercase lg:text-lg whitespace-nowrap">{col.title}</h4>
                <div className="flex flex-col gap-5">
                  {col.links.map((l) => (
                    <Link key={l.label} href={l.href} className="text-base lg:text-lg hover:text-primary-500 whitespace-nowrap">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-[30px] max-sm:col-span-2">
              <h4 className="text-base uppercase lg:text-lg whitespace-nowrap">Contact Us</h4>
              <Link href="mailto:support@usestellance.com" className="text-base tracking-[-0.01em] hover:text-primary-500">
                support@usestellance.com
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-14 text-base tracking-[0.01em] lg:mt-[60px] lg:px-[30px]">Copyright © Stellance Inc. 2025</p>
      </div>
    </footer>
  );
};

export default Footer;
