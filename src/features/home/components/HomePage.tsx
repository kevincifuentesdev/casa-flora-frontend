import { getHomeState } from "../services/homeService";
import { HomeProvider } from "../context/HomeContext";
import HeroSection from "./HeroSection";
import OurStorySection from "./OurStorySection";
import ProductShowcase from "./ProductShowcase";

export default function HomePage() {
    return (
        <HomeProvider value={getHomeState()}>
            <HeroSection />
            <OurStorySection />
            <ProductShowcase />
        </HomeProvider>
    );
}
