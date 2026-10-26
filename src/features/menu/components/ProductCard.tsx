"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartAdd } from "reicon-react";

import { useSession } from "@/features/auth/hooks/useSession";
import { createCustomerOrder } from "@/features/auth/services/authService";
import { formatPrice, type Product } from "@/features/products/domain/product";

export default function ProductCard({
    product,
    index,
}: {
    product: Product;
    index: number;
}) {
    const router = useRouter();
    const { isAuthenticated } = useSession();
    const [isOrdering, setIsOrdering] = useState(false);
    const [pointsNotice, setPointsNotice] = useState<number | null>(null);

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (isOrdering) return;

        setIsOrdering(true);
        const result = await createCustomerOrder({
            items: [{ productId: product.id, quantity: 1 }],
        });
        setIsOrdering(false);

        if (result.order) {
            setPointsNotice(result.order.pointsEarned);
            setTimeout(() => setPointsNotice(null), 3000);
        }
    };

    return (
        <div
            className="group flex animate-card-in flex-col overflow-hidden rounded-lg bg-surface shadow-[0_8px_24px_rgb(38_24_20/6%)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgb(38_24_20/12%)]"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5">
                    {product.categories.map((cat) => (
                        <span
                            key={cat}
                            className="rounded-full bg-[rgb(255_248_246/85%)] px-3 py-1 text-xs font-semibold text-accent backdrop-blur-xs dark:bg-[rgb(44_30_26/85%)]"
                        >
                            {cat}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex grow flex-col p-6">
                <h3 className="mt-0 mb-2 font-display text-2xl leading-8 text-primary">
                    {product.name}
                </h3>
                <p className="mt-0 mb-6 line-clamp-2 text-base leading-6 text-foreground-muted">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-secondary">
                        {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                        {pointsNotice !== null && (
                            <span
                                role="status"
                                className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                            >
                                +{pointsNotice} pts
                            </span>
                        )}
                        <button
                            type="button"
                            disabled={isOrdering}
                            onClick={() => void handleBuyNow()}
                            aria-label={`Comprar ${product.name} y ganar puntos`}
                            title="Comprar y ganar puntos"
                            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-2 text-primary transition hover:bg-primary/8 disabled:opacity-50"
                        >
                            <CartAdd
                                width={24}
                                height={24}
                                aria-hidden="true"
                                className="size-6 text-inherit"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
