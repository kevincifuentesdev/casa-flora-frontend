import type { Product } from "@/features/products/domain/product";

export interface HeroContent {
    title: string;
    description: string;
    logoUrl: string;
}

export interface StoryContent {
    title: string;
    paragraphs: string[];
    imageUrl: string;
    imageAlt: string;
}

export interface HomeContent {
    hero: HeroContent;
    story: StoryContent;
    showcaseTitle: string;
}

export interface HomeState {
    content: HomeContent;
    featuredProducts: Product[];
}
