import Header from "@/features/landing/components/Header";
import Hero from "@/features/landing/components/Hero";
import About from "@/features/landing/components/about/About";
import HowItWorks from "@/features/landing/components/HowItWorks";
import Among from "@/features/landing/components/Among";
import Features from "@/features/landing/components/features/Features";
import Benefits from "@/features/landing/components/Benefits";
import YourWork from "@/features/landing/components/YourWork";
import StartSending from "@/features/landing/components/StartSending";
import Footer from "@/features/landing/components/Footer";

export default function Home() {
	return (
		<main className="bg-neutral-500">
			<div id="home" className="bg-[linear-gradient(180deg,#000c3b_17%,#0021a1_100%)]">
				<Header />
				<Hero />
			</div>
			<About />
			<HowItWorks />
			<Among />
			<Features />
			<Benefits />
			<YourWork />
			<StartSending />
			<Footer />
		</main>
	);
}
