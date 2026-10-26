"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartLarge5 } from "reicon-react";

import { useSession } from "@/features/auth/hooks/useSession";
import { createCustomerOrder } from "@/features/auth/services/authService";
import Button from "@/features/common/components/Button";
import type { Product } from "@/features/products/domain/product";
import { formatPrice } from "@/features/products/domain/product";

export default function ProductCard({ product }: { product: Product }) {
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
        <article className="group flex flex-col overflow-hidden rounded-lg bg-surface shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
                {product.categories[0] && (
                    <div className="absolute top-4 left-4 z-10 rounded-full bg-background/85 px-3 py-1 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-accent">
                            {product.categories[0]}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex grow flex-col p-6">
                <h3 className="mb-2 font-display text-2xl text-primary">
                    {product.name}
                </h3>
                <p className="mb-6 line-clamp-2 text-foreground-muted">
                    {product.description}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-secondary">
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
                        <Button
                            variant="icon"
                            disabled={isOrdering}
                            onClick={() => void handleBuyNow()}
                            aria-label={`Comprar ${product.name} y ganar puntos`}
                        >
                            <CartLarge5 aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}
