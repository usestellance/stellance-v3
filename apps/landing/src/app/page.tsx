import Header from "@/features/landing/components/Header";
import Hero from "@/features/landing/components/Hero";
import About from "@/features/landing/components/about/About";
import EveryPayment from "@/features/landing/components/EveryPayment";
import HowItWorks from "@/features/landing/components/HowItWorks";
import Among from "@/features/landing/components/Among";
import Features from "@/features/landing/components/features/Features";
import Benefits from "@/features/landing/components/Benefits";
import YourWork from "@/features/landing/components/YourWork";
import Footer from "@/features/landing/components/Footer";

export default function Home() {
	return (
		<main className="bg-neutral-500">
			<div id="home" className="hero-bg bg-primary-500">
				<Header />
				<Hero />
			</div>
			<About />
			<EveryPayment />
			<HowItWorks />
			<Among />
			<Features />
			<Benefits />
			<YourWork />
			<Footer />
		</main>
	);
}
