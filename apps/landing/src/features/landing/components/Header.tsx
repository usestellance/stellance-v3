"use client";
import Link from "next/link";
import Image from "next/image";
import { IoIosMenu } from "react-icons/io";
import { Button } from "@repo/ui/button";
import { APP_LINKS } from "@/lib/site";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

const Header = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const gotoLogin = () => {
    window.location.assign(APP_LINKS.signIn);
    setIsNavOpen(false);
  };

  const gotoSignUp = () => {
    window.location.assign(APP_LINKS.signUp);
    setIsNavOpen(false);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // ✅ Detect scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // scrolling down → hide
      } else {
        setIsVisible(true); // scrolling up → show
      }

      // ✅ Detect if page left top
      setIsScrolled(currentScrollY > 0);

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  return (
    // <header className="text-neutral-500 py-4 md:py-5 fixed inset-x-0 top-0">
    <header
      className={`fixed inset-x-0 top-0 z-50  transition-all duration-300  py-4 md:py-5
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
        ${isScrolled ? "shadow-sm backdrop-blur-md bg-neutral-500 text-primary-500 " : "bg-transparent text-neutral-500"}
      `}
    >
      <div className="landing-container flex items-center justify-between gap-2 bg-gree-400">
        <Link href="/">
          <div className={`h-12 sm:h-16 md:h-20  w-fit bgred-400`}>
            {isScrolled ? (
              <Image
                src="/images/logo-primary-header.svg"
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src="/images/logo-white.svg"
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </Link>

        {/* MOBILE NAV */}
        <div
          className={`fixed inset-0 text-black-500 bg-neutral-50 h-screen pt-4 md:pt-6 lg:hidden ${isNavOpen ? "translate-y-0" : "-translate-y-[200%]"} transition-all duration-300`}
        >
          <div className="flex items-center justify-between landing-container">
            <div className={`h-12 sm:h-16 md:h-20  w-fit bgred-400`}>
              <Image
                src="/images/logo-primary-header.svg"
                alt="Stellance Logo"
                width={100}
                loading="eager"
                height={100}
                className="h-full w-full object-contain"
              />
            </div>
            <IoClose
              className="text-3xl sm:text-5xl"
              onClick={() => setIsNavOpen(false)}
            />
          </div>
          <nav className="mt-[72px] sm:mt-24">
            <ul className="flex flex-col gap-6 items-center text-lg font-light sm:text-normal sm:gap-10 sm:text-2xl">
              <li className="p-2.5">
                <Link
                  href="/#home"
                  className=""
                  onClick={() => setIsNavOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="p-2.5">
                <Link href="/#about" onClick={() => setIsNavOpen(false)}>
                  About
                </Link>
              </li>
              <li className="p-2.5">
                <Link href="/#how-it-works" onClick={() => setIsNavOpen(false)}>
                  How it works
                </Link>
              </li>
              <li className="p-2.5">
                <Link href="/#features" onClick={() => setIsNavOpen(false)}>
                  Features
                </Link>
              </li>
              <li className="p-2.5">
                <Link href="/#solutions" onClick={() => setIsNavOpen(false)}>
                  Solutions
                </Link>
              </li>
            </ul>

            <div className="flex gap-[30px] flex-col items-center mt-[30px]">
              <Button
                variant="outline"
                onClick={gotoLogin}
                className={`w-fit min-w-44 border-primary-500 hover:bg-neutral-500/50`}
              >
                Login
              </Button>
              <Button
                onClick={gotoSignUp}
                variant="default"
                className="w-fit min-w-44"
              >
                Sign up for free
              </Button>
            </div>
          </nav>
        </div>

        {/* DESKTOP NAV */}
        <div className="flex items-center justify-between gap-[60px] max-lg:hidden max-xl:gap-6">
          <nav className="bg-neutral-500/50 rounded-full px-5 xl:px-8">
            <ul className="flex gap-2 xl:gap-6 items-center text-base xl:text-lg">
              <li className="p-2.5 font-medium hover:text-primary-500 duration-150">
                <Link href="#home" className=" w-full h-fit inline-block">
                  Home
                </Link>
              </li>
              <li className="p-2.5 font-medium hover:text-primary-500 duration-150">
                <Link href="/#about">About</Link>
              </li>
              <li className="p-2.5 font-medium hover:text-primary-500 duration-150">
                <Link href="/#how-it-works" className="whitespace-nowrap">How it works</Link>
              </li>
              <li className="p-2.5 font-medium hover:text-primary-500 duration-150">
                <Link href="/#features">Features</Link>
              </li>
              <li className="p-2.5 font-medium hover:text-primary-500 duration-150">
                <Link href="/#solutions">Solutions</Link>
              </li>
            </ul>
          </nav>

          <div className="flex gap-3 xl:gap-[30px]">
            <Button
              variant="outline"
              onClick={gotoLogin}
              className={`w-fit min-w-40 ${isScrolled ? "border-primary-500" : "border-neutral-500"} h-14 hover:bg-neutral-500/50`}
            >
              Login
            </Button>
            <Button
              onClick={gotoSignUp}
              variant={isScrolled ? "default" : "secondary"}
              className="w-fit min-w-40"
            >
              Sign up for free
            </Button>
          </div>
        </div>
        <IoIosMenu
          className="text-4xl lg:hidden cursor-pointer"
          onClick={() => setIsNavOpen(true)}
        />
      </div>
    </header>
  );
};

export default Header;
