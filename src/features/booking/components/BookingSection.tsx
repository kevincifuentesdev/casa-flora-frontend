import Image from "next/image";

import { BookingFormProvider } from "../context/BookingFormContext";
import BookingForm from "./BookingForm";

export default function BookingSection() {
    return (
        <div className="mx-auto flex max-w-(--container-max) flex-col gap-(--spacing-gutter) px-(--spacing-margin-mobile) py-6 md:min-h-[calc(100vh-8rem)] md:flex-row md:items-start md:px-(--spacing-margin-desktop) md:py-8">
            <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-[var(--shadow-ambient-md)] md:sticky md:top-24 md:h-auto md:min-h-112 md:flex-1 md:self-start lg:min-h-128">
                <Image
                    src="/img/booking_hero.jpg"
                    alt="Interior cálido del restaurante Casa Flora con mesas de madera, iluminación ambiental y decoración tradicional colombiana"
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                    <div>
                        <h2 className="m-0 mb-2 font-display text-[2.75rem]/9 text-white md:text-[2rem]/10">
                            Tu Mesa te Espera
                        </h2>
                        <p className="m-0 text-lg/7 text-white/90">
                            Experimenta la calidez de nuestras recetas familiares en un ambiente único.
                        </p>
                    </div>
                </div>
            </div>
            <div className="md:flex-1">
                <BookingFormProvider>
                    <BookingForm />
                </BookingFormProvider>
            </div>
        </div>
    );
}
