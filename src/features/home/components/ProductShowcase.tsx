"use client";

import Link from "next/link";
import { ArrowRight } from "reicon-react";
import { useHome } from "../hooks/useHome";
import ProductCard from "./ProductCard";

export default function ProductShowcase() {
    const { content, featuredProducts } = useHome();

    return (
        <section className="mx-auto max-w-(--container-max) px-(--spacing-margin-mobile) py-12 md:px-(--spacing-margin-desktop)">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="font-display text-3xl leading-tight text-primary md:text-5xl">
                    {content.showcaseTitle}
                </h2>
                <Link
                    href="/menu"
                    className="hidden items-center gap-2 font-bold text-secondary transition hover:opacity-80 md:flex"
                >
                    Ver todo el menú
                    <ArrowRight className="size-6" aria-hidden="true" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
