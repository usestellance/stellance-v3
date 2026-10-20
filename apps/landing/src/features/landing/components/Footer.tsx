import Image from "next/image";
import Link from "next/link";
import { BsTwitterX } from "react-icons/bs";
import { RxInstagramLogo } from "react-icons/rx";
import { CiLinkedin } from "react-icons/ci";

const Footer = () => {
  return (
    <footer className="bg-primary-500 py-12 text-neutral-500">
      <div className="landing-container flex flex-col gap-16 sm:flex-row sm:items-start">
        <div className="flex gap-6 items-start sm:justify-between bg-re-400">
          <Link
            href="/"
            className={`min-w-16 sm:min-h-16 md:h-20  w-fit inline-block`}
          >
            <Image
              src="/images/logo-white.svg"
              alt="Stellance Logo"
              width={100}
              loading="eager"
              height={100}
              className="h-full w-full object-contain"
            />
          </Link>
          <div className="flex flex-col sm:gap-3 ">
            <h4 className="text-2xl md:text-[32px] w-fit">Stellance</h4>
            <p className="text-sm md:text-base sm:w-3/4">
              Invoicing and USDC payments on the Stellar network, with every
              payment verified against its invoice. Now on Stellar Testnet.
            </p>
          </div>
        </div>
        {/*  */}
        <div className="flex justify-between gap-10 lg:gap-20">
          <div className="text-sm sm:text-base md:text-lg">
            <h4 className="whitespace-nowrap">QUICK LINKS</h4>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/#home" className="">
                Home
              </Link>
              <Link href="/#about" className="">
                About
              </Link>
              <Link href="/#features" className="">
                Features
              </Link>
              <Link href="/#solutions" className="">
                Solutions
              </Link>
            </div>
          </div>
          <div className="text-sm sm:text-base md:text-lg">
            <h4 className="">CONTACT US</h4>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="mailto:support@usestellance.com" className="">
                support@usestellance.com
              </Link>
              <div className="text-3xl flex gap-3">
                {/* <Link href="#" className="">
                  <RxInstagramLogo />
                </Link> */}
                <Link
                  href="https://x.com/stellancehq?s=11"
                  target="_blank"
                  className=""
                >
                  <BsTwitterX />
                </Link>
                {/* <Link href="#" className="">
                  <CiLinkedin />
                </Link> */}
              </div>
            </div>
          </div>
        </div>
        <div className="max-xl:hidden text-center whitespace-nowrap">
          Copyright © Stellance Inc. 2025
        </div>
      </div>
      <div className="xl:hidden text-center whitespace-nowrap mt-20">
        Copyright © Stellance Inc. 2025
      </div>
    </footer>
  );
};

export default Footer;
