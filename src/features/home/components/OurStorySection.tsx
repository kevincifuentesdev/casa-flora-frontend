"use client";

import Image from "next/image";
import { useHome } from "../hooks/useHome";

export default function OurStorySection() {
    const { story } = useHome().content;

    return (
        <section className="mx-auto grid max-w-(--container-max) grid-cols-1 items-center gap-12 px-(--spacing-margin-mobile) py-16 md:grid-cols-2 md:px-(--spacing-margin-desktop)">
            <div className="flex flex-col justify-center md:order-2">
                <h2 className="mb-6 font-display text-3xl leading-tight text-primary md:text-4xl">
                    {story.title}
                </h2>
                {story.paragraphs.map((paragraph) => (
                    <p
                        key={paragraph}
                        className="text-foreground-muted not-last:mb-4"
                    >
                        {paragraph}
                    </p>
                ))}
            </div>

            <div className="relative order-2 h-96 min-h-100 overflow-hidden rounded-xl shadow-md md:order-1 md:h-full">
                <Image
                    src={story.imageUrl}
                    alt={story.imageAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                />
            </div>
        </section>
    );
}
