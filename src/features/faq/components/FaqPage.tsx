"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    AngleDown,
    AngleLeft,
    AngleRight,
    Call,
    Clock,
    SearchNormal2,
    Sms,
} from "reicon-react";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const ITEMS_PER_PAGE = 5;

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: "pedidos" | "reservas" | "pagos" | "fidelizacion" | "menu";
}

const FAQ_ITEMS: FaqItem[] = [
    // Pedidos
    {
        id: "zonas-cobertura",
        category: "pedidos",
        question: "¿A qué sectores del Valle de Aburrá realizan entregas a domicilio?",
        answer:
            "Cubrimos los principales sectores de Medellín y municipios cercanos, incluyendo El Poblado, Laureles, Envigado, Sabaneta, Belén, Estadio, Conquistadores y Robledo. Puedes ingresar tu dirección exacta en el carrito para verificar la cobertura y calcular el costo de entrega.",
    },
    {
        id: "tiempos-entrega",
        category: "pedidos",
        question: "¿Cuánto tiempo tarda en llegar mi pedido a domicilio?",
        answer:
            "El tiempo estimado promedio de entrega oscila entre 35 y 55 minutos. Nuestros platos se preparan al momento de recibir la orden (20 a 30 minutos de cocción en cocina) para garantizar su frescura, temperatura y textura artesanal.",
    },
    {
        id: "recogida-local",
        category: "pedidos",
        question: "¿Puedo pedir en línea y recoger en el restaurante?",
        answer:
            "Sí, en el carrito de compras puedes seleccionar la modalidad 'Recoger en el lugar' sin costo de envío. Tu pedido estará listo para entrega en la sede seleccionada (El Poblado o Laureles) en aproximadamente 20 a 30 minutos.",
    },
    {
        id: "limite-pedido",
        category: "pedidos",
        question: "¿Existe un límite de unidades por plato en un mismo pedido?",
        answer:
            "Sí, se permite un máximo de 20 unidades por cada plato en una orden. Esta política protege la calidad artesanal y los tiempos de despacho en cocina. Si requieres un volumen mayor para eventos corporativos o celebraciones, contáctanos directamente.",
    },

    // Reservas
    {
        id: "como-reservar",
        category: "reservas",
        question: "¿Cómo puedo reservar una mesa en Casa Flora?",
        answer:
            "Puedes reservar fácilmente ingresando a la sección 'Reservaciones' en nuestro menú de navegación. Solo debes elegir la fecha, el turno (almuerzo o cena), el número de comensales y el ambiente de tu preferencia.",
    },
    {
        id: "ambientes-diferencias",
        category: "reservas",
        question: "¿Qué diferencia hay entre el Patio interior y el Salón principal?",
        answer:
            "El Patio interior colonial ofrece un ambiente abierto con luz natural, vegetación nativa y ventilación fresca, con aforo para 24 personas. El Salón principal cuenta con maderas cálidas, iluminación tenue y un entorno íntimo con capacidad para 40 comensales.",
    },
    {
        id: "tolerancia-reserva",
        category: "reservas",
        question: "¿Cuánto tiempo de espera tienen si llego tarde a mi reserva?",
        answer:
            "Mantenemos la reserva durante 15 minutos posteriores a la hora pautada. Si tienes algún retraso involuntario por tráfico en la ciudad, te agradecemos llamarnos para conservar tu mesa.",
    },
    {
        id: "cancelar-reserva",
        category: "reservas",
        question: "¿Puedo cancelar o modificar mi reserva de mesa?",
        answer:
            "Sí, puedes cancelar tu reserva sin penalidad directamente desde la sección de reservas en tu perfil de usuario hasta 2 horas antes del turno programado.",
    },

    // Pagos
    {
        id: "medios-pago",
        category: "pagos",
        question: "¿Qué métodos de pago aceptan en la plataforma web?",
        answer:
            "Procesamos los pagos en línea de forma segura a través de Mercado Pago, admitiendo tarjetas de crédito (Visa, Mastercard, American Express), tarjetas débito con CVV y pagos mediante PSE desde cuentas bancarias colombianas.",
    },
    {
        id: "inicio-sesion-pago",
        category: "pagos",
        question: "¿Por qué es obligatorio iniciar sesión para realizar el pago?",
        answer:
            "Exigimos inicio de sesión para asociar de manera segura cada orden a tu cuenta, resguardar tus direcciones de entrega, permitirte hacer seguimiento al estado de despacho y acreditar automáticamente tus puntos del Club Casa Flora.",
    },
    {
        id: "seguridad-tarjetas",
        category: "pagos",
        question: "¿Es seguro pagar con tarjeta en Casa Flora?",
        answer:
            "Completamente. Toda la transacción transcurre bajo canales cifrados HTTPS/TLS y es gestionada directamente por la infraestructura certificada PCI-DSS de Mercado Pago. Casa Flora nunca almacena los datos de tu tarjeta ni códigos de seguridad.",
    },

    // Fidelización
    {
        id: "puntos-club",
        category: "fidelizacion",
        question: "¿Cómo acumulo puntos en el Club Casa Flora?",
        answer:
            "Por cada pedido pagado con una cuenta activa, acumulas automáticamente 1 punto por cada $10.000 COP consumidos. Puedes consultar tu balance de puntos en cualquier momento en tu página de perfil.",
    },
    {
        id: "canje-puntos",
        category: "fidelizacion",
        question: "¿Cómo y por qué premios puedo canjear mis puntos?",
        answer:
            "Tus puntos acumulados pueden canjearse por postres artesanales de la casa, bebidas tradicionales, platos fuertes de temporada o experiencias culinarias exclusivas que se habilitan en tu perfil a medida que alcanzas cada meta.",
    },

    // Menú
    {
        id: "opciones-veganas",
        category: "menu",
        question: "¿Cuentan con opciones vegetarianas o veganas?",
        answer:
            "Sí, contamos con platos libres de carne como nuestros rolls de yuca 'Silvestre' y preparaciones a base de vegetales frescos. Puedes utilizar el filtro 'Vegano' en la página de menú para visualizar todas las alternativas disponibles.",
    },
    {
        id: "alergias-adaptaciones",
        category: "menu",
        question: "¿Puedo solicitar adaptaciones en los platos por alergias o intolerancias?",
        answer:
            "Al momento de armar tu pedido o reservar, puedes dejar notas especiales sobre intolerancias o alergias (como gluten o lácteos). Nuestro equipo de cocina verificará la viabilidad de la preparación para garantizar tu bienestar.",
    },
];

const CATEGORIES = [
    { id: "todos", label: "Todas las preguntas" },
    { id: "pedidos", label: "Pedidos & Envíos" },
    { id: "reservas", label: "Reservas de Mesa" },
    { id: "pagos", label: "Pagos & Seguridad" },
    { id: "fidelizacion", label: "Club Casa Flora" },
    { id: "menu", label: "Carta & Alérgenos" },
] as const;

export default function FaqPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("todos");
    const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredFaqs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return FAQ_ITEMS.filter((item) => {
            const matchesCategory =
                selectedCategory === "todos" || item.category === selectedCategory;
            const matchesQuery =
                query.length === 0 ||
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [searchQuery, selectedCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedFaqs = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredFaqs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredFaqs, safeCurrentPage]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        setOpenId(null);
    };

    const handleCategoryChange = (catId: string) => {
        setSelectedCategory(catId);
        setCurrentPage(1);
        setOpenId(null);
    };

    const toggleItem = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-8 pb-24 md:px-(--spacing-margin-desktop) md:py-16 md:pb-28">
            {/* Header Hero */}
            <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase dark:bg-primary/20 dark:text-primary-foreground">
                    Centro de Ayuda
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl sm:leading-tight">
                    Preguntas Frecuentes
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base">
                    Encuentra respuestas claras y rápidas sobre nuestros pedidos
                    a domicilio, reservas de mesa, medios de pago y el programa de
                    fidelización de Casa Flora.
                </p>

                {/* Search Bar */}
                <div className="relative mx-auto mt-8 max-w-xl">
                    <SearchNormal2
                        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground-muted"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Busca por palabra clave (ej. domicilio, reserva, pago, puntos)..."
                        aria-label="Buscar en preguntas frecuentes"
                        className={`min-h-12 w-full rounded-full border border-foreground-muted/20 bg-surface py-3 pr-4 pl-11 text-xs text-foreground shadow-xs placeholder:text-foreground-muted sm:text-sm ${focusRing}`}
                    />
                </div>

                {/* Category Pills */}
                <div
                    role="tablist"
                    aria-label="Categorías de preguntas"
                    className="mt-6 flex flex-wrap items-center justify-center gap-2"
                >
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`inline-flex min-h-9 cursor-pointer items-center rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "border border-foreground-muted/20 bg-surface text-foreground hover:bg-background-alt"
                                } ${focusRing}`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* FAQ List */}
            <div className="mx-auto mt-12 max-w-3xl">
                {filteredFaqs.length === 0 ? (
                    <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-8 text-center sm:p-12">
                        <p className="m-0 font-display text-lg font-bold text-primary">
                            No encontramos respuestas para tu búsqueda
                        </p>
                        <p className="m-0 mt-2 text-xs text-foreground-muted sm:text-sm">
                            Intenta con otra palabra clave o restablece los filtros
                            para ver todas las preguntas.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("todos");
                                setCurrentPage(1);
                                setOpenId(null);
                            }}
                            className={`mt-4 inline-flex min-h-10 cursor-pointer items-center rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 ${focusRing}`}
                        >
                            Ver todas las preguntas
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 flex items-center justify-between text-xs text-foreground-muted">
                            <span>
                                {filteredFaqs.length}{" "}
                                {filteredFaqs.length === 1
                                    ? "pregunta encontrada"
                                    : "preguntas encontradas"}
                            </span>
                            {totalPages > 1 && (
                                <span>
                                    Página {safeCurrentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3.5">
                            {paginatedFaqs.map((item) => {
                                const isOpen = openId === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        className="overflow-hidden rounded-2xl border border-foreground-muted/15 bg-surface shadow-xs transition"
                                    >
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-answer-${item.id}`}
                                            onClick={() => toggleItem(item.id)}
                                            className={`flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition hover:bg-background-alt/50 sm:p-6 ${focusRing}`}
                                        >
                                            <span className="font-display text-base font-bold text-primary sm:text-lg">
                                                {item.question}
                                            </span>
                                            <span
                                                className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground-muted/20 bg-background text-primary transition-transform duration-200 ${
                                                    isOpen ? "rotate-180" : ""
                                                }`}
                                                aria-hidden="true"
                                            >
                                                <AngleDown className="size-4" />
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div
                                                id={`faq-answer-${item.id}`}
                                                role="region"
                                                className="border-t border-foreground-muted/10 px-5 pt-3.5 pb-5 text-xs leading-relaxed text-foreground-muted sm:px-6 sm:pb-6 sm:text-sm"
                                            >
                                                {item.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <nav
                                aria-label="Paginación de preguntas frecuentes"
                                className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-foreground-muted/15 pt-6 sm:flex-row"
                            >
                                <p className="m-0 text-xs text-foreground-muted">
                                    Mostrando{" "}
                                    {(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                                    a{" "}
                                    {Math.min(
                                        safeCurrentPage * ITEMS_PER_PAGE,
                                        filteredFaqs.length,
                                    )}{" "}
                                    de {filteredFaqs.length} preguntas
                                </p>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={safeCurrentPage <= 1}
                                        onClick={() => {
                                            setCurrentPage((prev) =>
                                                Math.max(1, prev - 1),
                                            );
                                            setOpenId(null);
                                        }}
                                        aria-label="Página anterior"
                                        className={`inline-flex min-h-9 items-center gap-1 rounded-full border border-foreground-muted/20 bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                    >
                                        <AngleLeft
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                        <span>Anterior</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1,
                                        ).map((page) => {
                                            const isCurrent =
                                                page === safeCurrentPage;
                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    aria-current={
                                                        isCurrent
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    aria-label={`Ir a la página ${page}`}
                                                    onClick={() => {
                                                        setCurrentPage(page);
                                                        setOpenId(null);
                                                    }}
                                                    className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition ${
                                                        isCurrent
                                                            ? "bg-primary text-primary-foreground shadow-xs"
                                                            : "border border-foreground-muted/20 bg-surface text-foreground hover:bg-background-alt"
                                                    } ${focusRing}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={safeCurrentPage >= totalPages}
                                        onClick={() => {
                                            setCurrentPage((prev) =>
                                                Math.min(totalPages, prev + 1),
                                            );
                                            setOpenId(null);
                                        }}
                                        aria-label="Página siguiente"
                                        className={`inline-flex min-h-9 items-center gap-1 rounded-full border border-foreground-muted/20 bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-alt disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                                    >
                                        <span>Siguiente</span>
                                        <AngleRight
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </nav>
                        )}
                    </div>
                )}
            </div>

            {/* Need More Help Card */}
            <div className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-foreground-muted/15 bg-surface p-6 shadow-xs sm:p-8">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-accent uppercase">
                            ¿Aún tienes dudas?
                        </span>
                        <h2 className="mt-1 font-display text-xl font-bold text-primary sm:text-2xl">
                            Estamos listos para atenderte
                        </h2>
                        <p className="mt-1.5 max-w-md text-xs text-foreground-muted sm:text-sm">
                            Comunícate con nuestro equipo en Medellín por correo o
                            teléfono de martes a domingo de 12:00 PM a 10:00 PM.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5 sm:shrink-0">
                        <a
                            href="mailto:contacto@casaflora.co"
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground no-underline shadow-xs transition hover:opacity-90 ${focusRing}`}
                        >
                            <Sms className="size-4" />
                            <span>contacto@casaflora.co</span>
                        </a>
                        <a
                            href="tel:+573001234567"
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/40 bg-surface px-5 py-2.5 text-xs font-bold text-primary no-underline transition hover:bg-background ${focusRing}`}
                        >
                            <Call className="size-4" />
                            <span>+57 (300) 123-4567</span>
                        </a>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-foreground-muted/15 pt-5 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 text-accent" />
                        <span>Atención: Martes a Domingo 12:00 PM a 10:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/menu"
                            className="font-bold text-primary no-underline hover:text-secondary"
                        >
                            Ver Menú
                        </Link>
                        <span>•</span>
                        <Link
                            href="/booking"
                            className="font-bold text-primary no-underline hover:text-secondary"
                        >
                            Reservaciones
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
