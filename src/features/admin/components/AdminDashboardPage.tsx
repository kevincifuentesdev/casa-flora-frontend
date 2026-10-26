"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Add,
    Calendar,
    Check,
    Copy,
    Edit2,
    Eye,
    ForkKnife,
    Receipt2,
    Refresh,
    Trash,
    X,
} from "reicon-react";

import type { OrderRecord } from "@/features/auth/domain/session";
import { useSession } from "@/features/auth/hooks/useSession";
import type {
    BookingRecord,
    BookingStatus,
    EnvironmentId,
    SlotAvailability,
} from "@/features/booking/domain/types";
import {
     formatPrice,
    type Product,
} from "@/features/products/domain/product";
import {
    type BookingAdminSort,
    type OrderStatus,
    cancelAdminBooking,
    createAdminProduct,
    deleteAdminProduct,
    fetchAdminBookingById,
    fetchAdminBookings,
    fetchAdminOrders,
    fetchAdminProducts,
    fetchDaySlotOccupancy,
    updateAdminBooking,
    updateAdminOrderStatus,
    updateAdminProduct,
} from "../services/adminService";

type AdminSection = "orders" | "bookings" | "products";
type BookingDayFilterMode = "all" | "today" | "tomorrow" | "next7" | "custom";

interface ProductFormState {
    id: string;
    name: string;
    price: string;
    categories: string[];
    description: string;
    imageUrl: string;
    available: boolean;
    sortOrder: string;
}

const ALL_PRODUCT_CATEGORIES = [
    "Entrada",
    "Vegano",
    "Plato Fuerte",
    "Especial del Día",
    "Bebida",
    "Postre",
] as const;

const BOOKING_TIME_SLOTS = ["13:00", "14:30", "19:00", "20:30"] as const;

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

function getBogotaIsoDate(offsetDays = 0): string {
    const target = new Date(Date.now() + offsetDays * 86_400_000);
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(target);
}

function slugifyProductName(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 64);
}

function formatDateTime(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return iso;
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed);
}

function formatReadableDate(isoDate: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!match) return isoDate;
    const [, y, m, d] = match.map(Number);
    const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(utc);
}

function getOrderStatusMeta(status: OrderStatus): {
    label: string;
    badgeClass: string;
} {
    switch (status) {
        case "preparing":
            return {
                label: "En preparación",
                badgeClass:
                    "border-secondary/45 bg-secondary/15 text-foreground",
            };
        case "delivered":
            return {
                label: "Entregado / Hecho",
                badgeClass: "border-primary/25 bg-primary/10 text-primary",
            };
        case "pending":
            return {
                label: "Pendiente de pago",
                badgeClass: "border-accent/40 bg-accent/15 text-primary",
            };
        case "cancelled":
        default:
            return {
                label: "Cancelado",
                badgeClass:
                    "border-destructive/30 bg-destructive/10 text-destructive",
            };
    }
}

function getBookingStatusMeta(status: BookingStatus): {
    label: string;
    badgeClass: string;
} {
    switch (status) {
        case "confirmed":
            return {
                label: "Confirmada",
                badgeClass: "border-primary/25 bg-primary/10 text-primary",
            };
        case "seated":
            return {
                label: "En mesa",
                badgeClass:
                    "border-secondary/50 bg-secondary/20 text-foreground",
            };
        case "completed":
            return {
                label: "Completada",
                badgeClass:
                    "border-foreground-muted/30 bg-background-alt text-foreground",
            };
        case "no_show":
            return {
                label: "No asistió",
                badgeClass: "border-accent/45 bg-accent/15 text-primary",
            };
        case "cancelled":
        default:
            return {
                label: "Cancelada",
                badgeClass:
                    "border-destructive/30 bg-destructive/10 text-destructive",
            };
    }
}

function formatDietPreference(value: string | null | undefined): string {
    if (value === "cows") return "Tradicional con carnes";
    if (value === "trees") return "Basada en plantas / Vegana";
    if (value === "both") return "Omnívora equilibrada";
    return "Sin registrar";
}

function formatSpiceTolerance(value: string | null | undefined): string {
    if (value === "none") return "Sin picante";
    if (value === "mild") return "Ají suave";
    if (value === "spicy") return "Picante intenso";
    return "Sin registrar";
}

function formatFavoriteMoment(value: string | null | undefined): string {
    if (value === "almuerzo") return "Almuerzo principal";
    if (value === "tarde") return "Tarde de tertulia";
    if (value === "postre") return "Postre y café";
    return "Sin registrar";
}

export default function AdminDashboardPage() {
    const { session, isLoading: isSessionLoading } = useSession();

    const [activeSection, setActiveSection] = useState<AdminSection>("orders");
    const [feedbackBanner, setFeedbackBanner] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);
    const [orderStatusFilter, setOrderStatusFilter] = useState<
        OrderStatus | "all"
    >("all");
    const [orderDeliveryFilter, setOrderDeliveryFilter] = useState<
        "all" | "delivery" | "pickup"
    >("all");
    const [orderSearch, setOrderSearch] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(
        null,
    );

    const [bookings, setBookings] = useState<BookingRecord[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [bookingDayMode, setBookingDayMode] =
        useState<BookingDayFilterMode>("all");
    const [customBookingDate, setCustomBookingDate] = useState<string>(() =>
        getBogotaIsoDate(0),
    );
    const [bookingEnvironmentFilter, setBookingEnvironmentFilter] = useState<
        EnvironmentId | "all"
    >("all");
    const [bookingStatusFilter, setBookingStatusFilter] = useState<
        BookingStatus | "all"
    >("all");
    const [bookingSort, setBookingSort] =
        useState<BookingAdminSort>("earliest");
    const [bookingSearch, setBookingSearch] = useState("");
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
        null,
    );
    const [selectedBooking, setSelectedBooking] =
        useState<BookingRecord | null>(null);
    const [bookingEditDraft, setBookingEditDraft] = useState<{
        environment: EnvironmentId;
        date: string;
        time: string;
        diners: number;
        status: BookingStatus;
    } | null>(null);
    const [occupancyDate, setOccupancyDate] = useState<string>(() =>
        getBogotaIsoDate(0),
    );
    const [dayOccupancy, setDayOccupancy] = useState<{
        interior: SlotAvailability[];
        patio: SlotAvailability[];
    } | null>(null);
    const [isLoadingOccupancy, setIsLoadingOccupancy] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState("");
    const [productCategoryFilter, setProductCategoryFilter] =
        useState<string>("all");
    const [productAvailabilityFilter, setProductAvailabilityFilter] = useState<
        "all" | "available" | "unavailable"
    >("all");
    const [productSort, setProductSort] = useState<
        "orden" | "precio-asc" | "precio-desc" | "nombre-az"
    >("orden");
    const [mutatingProductId, setMutatingProductId] = useState<string | null>(
        null,
    );
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<ProductFormState>({
        id: "",
        name: "",
        price: "15000",
        categories: ["Plato Fuerte"],
        description: "",
        imageUrl: "",
        available: true,
        sortOrder: "13",
    });
    const [idManuallyEdited, setIdManuallyEdited] = useState(false);
    const [productFormError, setProductFormError] = useState<string | null>(
        null,
    );
    const [isSavingProduct, setIsSavingProduct] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null,
    );

    const isAdmin = session?.user?.role === "admin";

    const loadOrders = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingOrders(true);
        setOrdersError(null);
        const res = await fetchAdminOrders();
        setIsLoadingOrders(false);
        if (res.error || !res.orders) {
            setOrdersError(
                res.error ?? "No se pudieron consultar los pedidos.",
            );
            return;
        }
        setOrders(res.orders);
    }, [isAdmin]);

    const loadBookings = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingBookings(true);
        setBookingsError(null);

        const today = getBogotaIsoDate(0);
        const tomorrow = getBogotaIsoDate(1);
        const next7 = getBogotaIsoDate(7);

        const query: Parameters<typeof fetchAdminBookings>[0] = {
            sort: bookingSort,
        };

        if (bookingDayMode === "today") {
            query.date = today;
        } else if (bookingDayMode === "tomorrow") {
            query.date = tomorrow;
        } else if (bookingDayMode === "next7") {
            query.dateFrom = today;
            query.dateTo = next7;
        } else if (bookingDayMode === "custom" && customBookingDate) {
            query.date = customBookingDate;
        }

        if (bookingEnvironmentFilter !== "all") {
            query.environment = bookingEnvironmentFilter;
        }
        if (bookingStatusFilter !== "all") {
            query.status = bookingStatusFilter;
        }

        const res = await fetchAdminBookings(query);
        setIsLoadingBookings(false);
        if (res.error || !res.bookings) {
            setBookingsError(
                res.error ?? "No se pudieron consultar las reservas.",
            );
            return;
        }
        setBookings(res.bookings);
    }, [
        isAdmin,
        bookingSort,
        bookingDayMode,
        customBookingDate,
        bookingEnvironmentFilter,
        bookingStatusFilter,
    ]);

    const loadDayOccupancy = useCallback(
        async (targetDate: string) => {
            if (!isAdmin || !targetDate) return;
            setIsLoadingOccupancy(true);
            const res = await fetchDaySlotOccupancy(targetDate);
            setIsLoadingOccupancy(false);
            if (res.interior && res.patio) {
                setDayOccupancy({
                    interior: res.interior,
                    patio: res.patio,
                });
            }
        },
        [isAdmin],
    );

    const loadProducts = useCallback(async () => {
        if (!isAdmin) return;
        setIsLoadingProducts(true);
        setProductsError(null);
        const res = await fetchAdminProducts();
        setIsLoadingProducts(false);
        if (res.error || !res.products) {
            setProductsError(
                res.error ?? "No se pudo cargar el catálogo de platos.",
            );
            return;
        }
        setProducts(res.products);
    }, [isAdmin]);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) {
                void loadOrders();
                void loadProducts();
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin, loadOrders, loadProducts]);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) {
                void loadBookings();
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin, loadBookings]);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (!cancelled) {
                void loadDayOccupancy(occupancyDate);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [isAdmin, occupancyDate, loadDayOccupancy]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedOrder(null);
                setSelectedBooking(null);
                setBookingEditDraft(null);
                setIsProductModalOpen(false);
                setProductToDelete(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (
                orderStatusFilter !== "all" &&
                order.status !== orderStatusFilter
            ) {
                return false;
            }
            const isDelivery = order.addressLabel
                .toLowerCase()
                .includes("domicilio");
            if (orderDeliveryFilter === "delivery" && !isDelivery) return false;
            if (orderDeliveryFilter === "pickup" && isDelivery) return false;

            const q = orderSearch.trim().toLowerCase();
            if (!q) return true;

            const matchesNumber =
                String(order.orderNumber).includes(q) ||
                `#${order.orderNumber}`.includes(q) ||
                order.id.toLowerCase().includes(q);
            const matchesCustomer =
                order.customer?.name.toLowerCase().includes(q) ||
                order.customer?.email.toLowerCase().includes(q) ||
                (order.customer?.username?.toLowerCase().includes(q) ?? false);
            const matchesAddress = order.addressLabel
                .toLowerCase()
                .includes(q);
            const matchesItems = order.items.some((i) =>
                i.productName.toLowerCase().includes(q),
            );
            return (
                matchesNumber ||
                matchesCustomer ||
                matchesAddress ||
                matchesItems
            );
        });
    }, [orders, orderStatusFilter, orderDeliveryFilter, orderSearch]);

    const filteredBookings = useMemo(() => {
        const q = bookingSearch.trim().toLowerCase();
        if (!q) return bookings;
        return bookings.filter((b) => {
            const matchesId = b.id.toLowerCase().includes(q);
            const matchesCustomer =
                b.customer?.name.toLowerCase().includes(q) ||
                b.customer?.email.toLowerCase().includes(q) ||
                (b.customer?.username?.toLowerCase().includes(q) ?? false);
            const matchesDate = b.date.includes(q) || b.time.includes(q);
            return matchesId || matchesCustomer || matchesDate;
        });
    }, [bookings, bookingSearch]);

    const filteredProducts = useMemo(() => {
        const list = products.filter((p) => {
            const isAvailable = p.available !== false;
            if (productAvailabilityFilter === "available" && !isAvailable) {
                return false;
            }
            if (productAvailabilityFilter === "unavailable" && isAvailable) {
                return false;
            }
            if (
                productCategoryFilter !== "all" &&
                !p.categories.includes(productCategoryFilter)
            ) {
                return false;
            }
            const q = productSearch.trim().toLowerCase();
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.categories.some((c) => c.toLowerCase().includes(q))
            );
        });

        return [...list].sort((a, b) => {
            if (productSort === "precio-asc") return a.price - b.price;
            if (productSort === "precio-desc") return b.price - a.price;
            if (productSort === "nombre-az") {
                return a.name.localeCompare(b.name, "es");
            }
            return (
                (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
                a.name.localeCompare(b.name, "es")
            );
        });
    }, [
        products,
        productAvailabilityFilter,
        productCategoryFilter,
        productSearch,
        productSort,
    ]);

    const orderStats = useMemo(() => {
        const preparing = orders.filter((o) => o.status === "preparing").length;
        const pending = orders.filter((o) => o.status === "pending").length;
        const delivered = orders.filter((o) => o.status === "delivered").length;
        const confirmedRevenue = orders
            .filter(
                (o) => o.status === "preparing" || o.status === "delivered",
            )
            .reduce((sum, o) => sum + o.totalAmount, 0);
        return { preparing, pending, delivered, confirmedRevenue };
    }, [orders]);

    const bookingStats = useMemo(() => {
        const today = getBogotaIsoDate(0);
        const todayConfirmed = bookings.filter(
            (b) =>
                b.date === today &&
                (b.status === "confirmed" || b.status === "seated"),
        ).length;
        const activeCount = bookings.filter(
            (b) => b.status === "confirmed" || b.status === "seated",
        ).length;
        const totalDinersActive = bookings
            .filter((b) => b.status === "confirmed" || b.status === "seated")
            .reduce((sum, b) => sum + b.diners, 0);
        return { todayConfirmed, activeCount, totalDinersActive };
    }, [bookings]);

    const handleOrderStatusChange = async (
        orderId: string,
        nextStatus: OrderStatus,
    ) => {
        setUpdatingOrderId(orderId);
        setFeedbackBanner(null);
        const res = await updateAdminOrderStatus(orderId, nextStatus);
        setUpdatingOrderId(null);

        if (res.error || !res.order) {
            setFeedbackBanner({
                type: "error",
                message:
                    res.error ??
                    "No se pudo cambiar el estado del pedido seleccionado.",
            });
            return;
        }

        const updatedOrder = res.order;
        setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        );
        if (selectedOrder?.id === updatedOrder.id) {
            setSelectedOrder(updatedOrder);
        }
        setFeedbackBanner({
            type: "success",
            message: `Orden #${updatedOrder.orderNumber} actualizada a "${getOrderStatusMeta(updatedOrder.status).label}".`,
        });
    };

    const handleOpenBookingModal = async (booking: BookingRecord) => {
        setSelectedBooking(booking);
        setBookingEditDraft({
            environment: booking.environment,
            date: booking.date,
            time: booking.time,
            diners: booking.diners,
            status: booking.status,
        });

        const fresh = await fetchAdminBookingById(booking.id);
        if (fresh.booking) {
            setSelectedBooking(fresh.booking);
            setBookingEditDraft({
                environment: fresh.booking.environment,
                date: fresh.booking.date,
                time: fresh.booking.time,
                diners: fresh.booking.diners,
                status: fresh.booking.status,
            });
        }
    };

    const handleQuickBookingStatus = async (
        bookingId: string,
        status: BookingStatus,
    ) => {
        setUpdatingBookingId(bookingId);
        setFeedbackBanner(null);

        const res =
            status === "cancelled"
                ? await cancelAdminBooking(bookingId)
                : await updateAdminBooking(bookingId, { status });
        setUpdatingBookingId(null);

        if (res.error || !res.booking) {
            setFeedbackBanner({
                type: "error",
                message: res.error ?? "No se pudo actualizar la reserva.",
            });
            return;
        }

        const updated = res.booking;
        setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        if (selectedBooking?.id === updated.id) {
            setSelectedBooking(updated);
            setBookingEditDraft({
                environment: updated.environment,
                date: updated.date,
                time: updated.time,
                diners: updated.diners,
                status: updated.status,
            });
        }
        void loadDayOccupancy(occupancyDate);
        setFeedbackBanner({
            type: "success",
            message: `Reserva del ${updated.date} (${updated.time}) marcada como "${getBookingStatusMeta(updated.status).label}".`,
        });
    };

    const handleSaveBookingDetails = async () => {
        if (!selectedBooking || !bookingEditDraft) return;
        setUpdatingBookingId(selectedBooking.id);
        setFeedbackBanner(null);

        const res = await updateAdminBooking(
            selectedBooking.id,
            bookingEditDraft,
        );
        setUpdatingBookingId(null);

        if (res.error || !res.booking) {
            setFeedbackBanner({
                type: "error",
                message:
                    res.error ??
                    "No se pudieron guardar los cambios de la reserva.",
            });
            return;
        }

        const updated = res.booking;
        setBookings((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        setSelectedBooking(updated);
        void loadDayOccupancy(occupancyDate);
        setFeedbackBanner({
            type: "success",
            message: "Ficha de reserva actualizada correctamente.",
        });
    };

    const openCreateProductModal = (template?: Product) => {
        setEditingProduct(null);
        setProductFormError(null);
        const nextSort =
            products.reduce(
                (max, item) => Math.max(max, item.sortOrder ?? 0),
                0,
            ) + 1;
        if (template) {
            const baseName = `${template.name} Especial`;
            setProductForm({
                id: slugifyProductName(baseName),
                name: baseName,
                price: String(template.price),
                categories: [...template.categories],
                description: template.description,
                imageUrl: template.imageUrl,
                available: true,
                sortOrder: String(nextSort),
            });
            setIdManuallyEdited(false);
        } else {
            setProductForm({
                id: "",
                name: "",
                price: "18000",
                categories: ["Plato Fuerte"],
                description: "",
                imageUrl: "",
                available: true,
                sortOrder: String(nextSort),
            });
            setIdManuallyEdited(false);
        }
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product);
        setProductFormError(null);
        setProductForm({
            id: product.id,
            name: product.name,
            price: String(product.price),
            categories: [...product.categories],
            description: product.description,
            imageUrl: product.imageUrl,
            available: product.available !== false,
            sortOrder: String(product.sortOrder ?? 1),
        });
        setIdManuallyEdited(true);
        setIsProductModalOpen(true);
    };

    const handleToggleFormCategory = (cat: string) => {
        setProductForm((prev) => {
            const exists = prev.categories.includes(cat);
            if (exists) {
                return {
                    ...prev,
                    categories: prev.categories.filter((c) => c !== cat),
                };
            }
            if (prev.categories.length >= 4) {
                return prev;
            }
            return {
                ...prev,
                categories: [...prev.categories, cat],
            };
        });
    };

    const handleSubmitProductForm = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setProductFormError(null);

        const cleanId = productForm.id.trim().toLowerCase();
        const cleanName = productForm.name.trim();
        const parsedPrice = Number(productForm.price);
        const parsedSortOrder = Number(productForm.sortOrder);
        const cleanDesc = productForm.description.trim();
        const cleanImage = productForm.imageUrl.trim();

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanId) || cleanId.length < 2) {
            setProductFormError(
                "El identificador (slug) debe tener al menos 2 caracteres en minúscula, números o guiones (ej. cazuela-andina).",
            );
            return;
        }
        if (cleanName.length < 2 || cleanName.length > 80) {
            setProductFormError(
                "El nombre del plato debe tener entre 2 y 80 caracteres.",
            );
            return;
        }
        if (
            !Number.isInteger(parsedPrice) ||
            parsedPrice < 0 ||
            parsedPrice > 1_000_000
        ) {
            setProductFormError(
                "Ingresa un precio entero válido en pesos colombianos (entre $0 y $1.000.000).",
            );
            return;
        }
        if (
            productForm.categories.length < 1 ||
            productForm.categories.length > 4
        ) {
            setProductFormError(
                "Selecciona entre 1 y 4 categorías para clasificar el plato en la carta.",
            );
            return;
        }
        if (cleanDesc.length < 10 || cleanDesc.length > 400) {
            setProductFormError(
                "La descripción gastronómica debe tener entre 10 y 400 caracteres.",
            );
            return;
        }
        try {
            const urlObj = new URL(cleanImage);
            if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
                throw new Error("Invalid protocol");
            }
        } catch {
            setProductFormError(
                "Ingresa una URL válida (http:// o https://) para la fotografía del plato.",
            );
            return;
        }

        setIsSavingProduct(true);
        if (editingProduct) {
            const res = await updateAdminProduct(editingProduct.id, {
                name: cleanName,
                price: parsedPrice,
                categories: productForm.categories,
                description: cleanDesc,
                imageUrl: cleanImage,
                available: productForm.available,
                sortOrder: Number.isInteger(parsedSortOrder)
                    ? Math.max(0, parsedSortOrder)
                    : 0,
            });
            setIsSavingProduct(false);
            if (res.error || !res.product) {
                setProductFormError(
                    res.error ?? "No se pudo actualizar el plato.",
                );
                return;
            }
            const updated = res.product;
            setProducts((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p)),
            );
            setIsProductModalOpen(false);
            setFeedbackBanner({
                type: "success",
                message: `Plato "${updated.name}" actualizado en la carta.`,
            });
        } else {
            const res = await createAdminProduct({
                id: cleanId,
                name: cleanName,
                price: parsedPrice,
                categories: productForm.categories,
                description: cleanDesc,
                imageUrl: cleanImage,
                available: productForm.available,
                sortOrder: Number.isInteger(parsedSortOrder)
                    ? Math.max(0, parsedSortOrder)
                    : 0,
            });
            setIsSavingProduct(false);
            if (res.error || !res.product) {
                setProductFormError(res.error ?? "No se pudo crear el plato.");
                return;
            }
            const created = res.product;
            setProducts((prev) => [...prev, created]);
            setIsProductModalOpen(false);
            setFeedbackBanner({
                type: "success",
                message: `Plato "${created.name}" agregado exitosamente al menú.`,
            });
        }
    };

    const handleToggleProductAvailability = async (product: Product) => {
        const nextAvailable = product.available === false;
        setMutatingProductId(product.id);
        setFeedbackBanner(null);
        const res = await updateAdminProduct(product.id, {
            available: nextAvailable,
        });
        setMutatingProductId(null);

        if (res.error || !res.product) {
            setFeedbackBanner({
                type: "error",
                message:
                    res.error ??
                    "No se pudo cambiar la disponibilidad del plato.",
            });
            return;
        }

        const updated = res.product;
        setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        setFeedbackBanner({
            type: "success",
            message: nextAvailable
                ? `"${updated.name}" está nuevamente disponible en la carta pública.`
                : `"${updated.name}" se marcó como agotado temporalmente.`,
        });
    };

    const handleToggleDailySpecial = async (product: Product) => {
        const hasSpecial = product.categories.includes("Especial del Día");
        let nextCategories: string[];
        if (hasSpecial) {
            nextCategories = product.categories.filter(
                (c) => c !== "Especial del Día",
            );
            if (nextCategories.length === 0) {
                nextCategories = ["Plato Fuerte"];
            }
        } else {
            if (product.categories.length >= 4) {
                setFeedbackBanner({
                    type: "error",
                    message:
                        "Un plato puede tener máximo 4 categorías. Edita sus categorías para destacar como Especial del Día.",
                });
                return;
            }
            nextCategories = [...product.categories, "Especial del Día"];
        }

        setMutatingProductId(product.id);
        setFeedbackBanner(null);
        const res = await updateAdminProduct(product.id, {
            categories: nextCategories,
        });
        setMutatingProductId(null);

        if (res.error || !res.product) {
            setFeedbackBanner({
                type: "error",
                message:
                    res.error ??
                    "No se pudo actualizar la categoría Especial del Día.",
            });
            return;
        }

        const updated = res.product;
        setProducts((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        setFeedbackBanner({
            type: "success",
            message: hasSpecial
                ? `"${updated.name}" ya no figura como Especial del Día.`
                : `"${updated.name}" ahora destaca como Especial del Día.`,
        });
    };

    const handleConfirmDeleteProduct = async () => {
        if (!productToDelete) return;
        const target = productToDelete;
        setMutatingProductId(target.id);
        setFeedbackBanner(null);

        const res = await deleteAdminProduct(target.id);
        setMutatingProductId(null);
        setProductToDelete(null);

        if (!res.ok) {
            setFeedbackBanner({
                type: "error",
                message: res.error ?? "No se pudo eliminar el plato.",
            });
            return;
        }

        setProducts((prev) => prev.filter((p) => p.id !== target.id));
        setFeedbackBanner({
            type: "success",
            message: `Plato "${target.name}" eliminado permanentemente del catálogo.`,
        });
    };

    if (isSessionLoading) {
        return (
            <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-14 pb-28 md:px-(--spacing-margin-desktop)">
                <div
                    role="status"
                    aria-live="polite"
                    className="rounded-2xl border border-foreground-muted/15 bg-surface p-10 text-center text-foreground-muted shadow-(--shadow-ambient-sm)"
                >
                    Verificando credenciales de administración de Casa Flora...
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="mx-auto w-full max-w-2xl px-(--spacing-margin-mobile) py-14 pb-28 md:px-(--spacing-margin-desktop)">
                <div
                    role="alert"
                    className="rounded-2xl border border-foreground-muted/20 bg-surface p-8 text-center shadow-(--shadow-ambient-md)"
                >
                    <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                        Código 401 • Sesión requerida
                    </p>
                    <h1 className="m-0 mt-2 font-display text-3xl font-bold text-primary">
                        Acceso exclusivo para administración
                    </h1>
                    <p className="mt-3 text-sm text-foreground-muted">
                        Debes iniciar sesión con una cuenta de administrador de
                        Casa Flora para gestionar pedidos, reservas y el
                        catálogo gastronómico.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/login"
                            className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href="/"
                            className={`inline-flex min-h-11 items-center justify-center rounded-full border border-foreground-muted/30 px-6 py-2.5 text-sm font-semibold text-foreground no-underline transition hover:bg-background-alt ${focusRing}`}
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (session.user.role !== "admin") {
        return (
            <div className="mx-auto w-full max-w-2xl px-(--spacing-margin-mobile) py-14 pb-28 md:px-(--spacing-margin-desktop)">
                <div
                    role="alert"
                    className="rounded-2xl border border-destructive/35 bg-surface p-8 text-center shadow-(--shadow-ambient-md)"
                >
                    <p className="m-0 text-xs font-bold tracking-wider text-destructive uppercase">
                        Código 403 • Acceso prohibido
                    </p>
                    <h1 className="m-0 mt-2 font-display text-3xl font-bold text-primary">
                        No tienes permisos de administrador
                    </h1>
                    <p className="mt-3 text-sm text-foreground-muted">
                        Tu cuenta actual (
                        <strong className="text-foreground">
                            {session.user.email}
                        </strong>
                        ) tiene rol de comensal. Solo el personal autorizado con
                        rol de administrador puede acceder al panel operativo de
                        Casa Flora.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/profile"
                            className={`inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground no-underline transition hover:opacity-90 ${focusRing}`}
                        >
                            Ir a mi perfil
                        </Link>
                        <Link
                            href="/menu"
                            className={`inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-6 py-2.5 text-sm font-semibold text-primary no-underline transition hover:bg-background-alt ${focusRing}`}
                        >
                            Explorar el menú
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-6 pb-28 md:px-(--spacing-margin-desktop) md:py-8 md:pb-12">
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                {/* Desktop Sidebar */}
                <aside
                    aria-label="Panel lateral de administración"
                    className="hidden md:flex md:w-64 lg:w-72 md:shrink-0 md:sticky md:top-24 flex-col gap-5 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-sm)"
                >
                    <div>
                        <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                            Casa Flora • Sede El Poblado
                        </p>
                        <h1 className="m-0 mt-1 font-display text-xl font-bold text-primary lg:text-2xl">
                            Panel Operativo
                        </h1>
                        <div className="mt-3 rounded-xl border border-foreground-muted/15 bg-background/60 p-3">
                            <p className="m-0 text-[11px] font-semibold text-foreground-muted">
                                Sesión activa como:
                            </p>
                            <p
                                className="m-0 mt-0.5 truncate text-xs font-bold text-foreground"
                                title={session.user.name}
                            >
                                {session.user.name}
                            </p>
                            <p
                                className="m-0 truncate text-[11px] text-foreground-muted"
                                title={session.user.email}
                            >
                                {session.user.email}
                            </p>
                        </div>
                    </div>

                    <div
                        role="tablist"
                        aria-label="Secciones de administración"
                        className="flex flex-col gap-2"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeSection === "orders"}
                            onClick={() => setActiveSection("orders")}
                            className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${focusRing} ${
                                activeSection === "orders"
                                    ? "bg-primary text-primary-foreground shadow-(--shadow-ambient-sm)"
                                    : "border border-foreground-muted/20 bg-background text-foreground hover:bg-background-alt"
                            }`}
                        >
                            <span className="inline-flex items-center gap-2.5">
                                <Receipt2 className="size-4 shrink-0" aria-hidden="true" />
                                <span>Pedidos de cocina</span>
                            </span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    activeSection === "orders"
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-primary/10 text-primary"
                                }`}
                            >
                                {orders.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeSection === "bookings"}
                            onClick={() => setActiveSection("bookings")}
                            className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${focusRing} ${
                                activeSection === "bookings"
                                    ? "bg-primary text-primary-foreground shadow-(--shadow-ambient-sm)"
                                    : "border border-foreground-muted/20 bg-background text-foreground hover:bg-background-alt"
                            }`}
                        >
                            <span className="inline-flex items-center gap-2.5">
                                <Calendar className="size-4 shrink-0" aria-hidden="true" />
                                <span>Reservas de mesa</span>
                            </span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    activeSection === "bookings"
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-primary/10 text-primary"
                                }`}
                            >
                                {bookings.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeSection === "products"}
                            onClick={() => setActiveSection("products")}
                            className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${focusRing} ${
                                activeSection === "products"
                                    ? "bg-primary text-primary-foreground shadow-(--shadow-ambient-sm)"
                                    : "border border-foreground-muted/20 bg-background text-foreground hover:bg-background-alt"
                            }`}
                        >
                            <span className="inline-flex items-center gap-2.5">
                                <ForkKnife className="size-4 shrink-0" aria-hidden="true" />
                                <span>Catálogo de platos</span>
                            </span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    activeSection === "products"
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-primary/10 text-primary"
                                }`}
                            >
                                {products.length}
                            </span>
                        </button>
                    </div>

                    <div className="border-t border-foreground-muted/15 pt-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (activeSection === "orders") void loadOrders();
                                else if (activeSection === "bookings") void loadBookings();
                                else void loadProducts();
                            }}
                            className={`inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-foreground-muted/25 bg-background px-3 py-2 text-xs font-bold text-primary transition hover:bg-background-alt ${focusRing}`}
                        >
                            <Refresh className="size-3.5 shrink-0" aria-hidden="true" />
                            <span>Actualizar datos</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="min-w-0 flex-1 space-y-6">
                    {/* Mobile Header (shown only on mobile < md) */}
                    <header className="rounded-2xl border border-foreground-muted/15 bg-surface p-4 shadow-(--shadow-ambient-sm) md:hidden">
                        <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                            Casa Flora • Sede El Poblado
                        </p>
                        <h1 className="m-0 mt-1 font-display text-xl font-bold text-primary">
                            Panel Operativo de Administración
                        </h1>
                        <p className="m-0 mt-1 text-xs text-foreground-muted">
                            Sesión activa como{" "}
                            <strong className="text-foreground">
                                {session.user.name}
                            </strong>
                        </p>
                    </header>

                    {feedbackBanner && (
                        <div
                            role={feedbackBanner.type === "error" ? "alert" : "status"}
                            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                                feedbackBanner.type === "error"
                                    ? "border-destructive/35 bg-destructive/10 text-destructive"
                                    : "border-primary/25 bg-primary/10 text-primary"
                            }`}
                        >
                            <span>{feedbackBanner.message}</span>
                            <button
                                type="button"
                                onClick={() => setFeedbackBanner(null)}
                                className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold underline ${focusRing}`}
                            >
                                <X className="size-3.5 shrink-0" aria-hidden="true" />
                                <span>Cerrar aviso</span>
                            </button>
                        </div>
                    )}

                    {activeSection === "orders" && (
                <section
                    aria-label="Gestión de pedidos"
                    className="mt-6 space-y-6"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                En preparación (cocina activa)
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-primary">
                                {orderStats.preparing}
                            </p>
                        </div>
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Pendientes de pago
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-accent">
                                {orderStats.pending}
                            </p>
                        </div>
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Pedidos completados / entregados
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-foreground">
                                {orderStats.delivered}
                            </p>
                        </div>
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Facturación confirmada
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-primary">
                                {formatPrice(orderStats.confirmedRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-sm)">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex-1">
                                <label
                                    htmlFor="admin-order-search"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Buscar por número de orden, cliente,
                                    dirección o plato
                                </label>
                                <input
                                    id="admin-order-search"
                                    type="search"
                                    value={orderSearch}
                                    onChange={(e) =>
                                        setOrderSearch(e.target.value)
                                    }
                                    placeholder="Ej. #6, Kevin, El Poblado, Abuela..."
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                />
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <div>
                                    <label
                                        htmlFor="admin-order-status"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Estado del pedido
                                    </label>
                                    <select
                                        id="admin-order-status"
                                        value={orderStatusFilter}
                                        onChange={(e) =>
                                            setOrderStatusFilter(
                                                e.target.value as
                                                    | OrderStatus
                                                    | "all",
                                            )
                                        }
                                        className={`mt-1.5 min-h-11 rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="all">
                                            Todos los estados
                                        </option>
                                        <option value="preparing">
                                            En preparación
                                        </option>
                                        <option value="pending">
                                            Pendiente de pago
                                        </option>
                                        <option value="delivered">
                                            Entregado / Hecho
                                        </option>
                                        <option value="cancelled">
                                            Cancelado
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin-order-delivery"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Modalidad
                                    </label>
                                    <select
                                        id="admin-order-delivery"
                                        value={orderDeliveryFilter}
                                        onChange={(e) =>
                                            setOrderDeliveryFilter(
                                                e.target.value as
                                                    | "all"
                                                    | "delivery"
                                                    | "pickup",
                                            )
                                        }
                                        className={`mt-1.5 min-h-11 rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="all">Todas</option>
                                        <option value="delivery">
                                            Domicilio
                                        </option>
                                        <option value="pickup">
                                            Recogida en local
                                        </option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void loadOrders()}
                                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent px-4 py-2 text-xs font-bold text-primary transition hover:bg-background-alt ${focusRing}`}
                                >
                                    <Refresh className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Actualizar lista</span>
                                </button>
                            </div>
                        </div>

                        {ordersError && (
                            <div
                                role="alert"
                                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                            >
                                <span>{ordersError}</span>
                                <button
                                    type="button"
                                    onClick={() => void loadOrders()}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 font-bold underline ${focusRing}`}
                                >
                                    <Refresh className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Reintentar carga</span>
                                </button>
                            </div>
                        )}

                        {isLoadingOrders ? (
                            <p className="mt-5 text-sm text-foreground-muted">
                                Consultando pedidos y sincronizando pagos con
                                Mercado Pago...
                            </p>
                        ) : filteredOrders.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-foreground-muted/15 bg-background p-6 text-center">
                                <p className="m-0 font-display text-base font-bold text-primary">
                                    No hay pedidos que coincidan con el filtro
                                    actual
                                </p>
                                <p className="m-0 mt-1 text-xs text-foreground-muted">
                                    Cambia los criterios de búsqueda o limpia el
                                    filtro de estado para ver todos los pedidos
                                    registrados.
                                </p>
                            </div>
                        ) : (
                            <ul className="m-0 mt-5 list-none divide-y divide-foreground-muted/15 p-0">
                                {filteredOrders.map((order) => {
                                    const statusMeta = getOrderStatusMeta(
                                        order.status,
                                    );
                                    const isBusy = updatingOrderId === order.id;
                                    const isDelivery = order.addressLabel
                                        .toLowerCase()
                                        .includes("domicilio");

                                    return (
                                        <li
                                            key={order.id}
                                            className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-display text-base font-bold text-primary">
                                                        Orden #
                                                        {order.orderNumber}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
                                                    >
                                                        {statusMeta.label}
                                                    </span>
                                                    <span className="rounded-md bg-background-alt px-2 py-0.5 text-xs font-semibold text-foreground-muted">
                                                        {isDelivery
                                                            ? "Domicilio"
                                                            : "Recogida en local"}
                                                    </span>
                                                    <span className="text-xs text-foreground-muted">
                                                        {formatDateTime(
                                                            order.createdAt,
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="m-0 text-sm font-semibold text-foreground">
                                                    {order.items
                                                        .map(
                                                            (i) =>
                                                                `${i.quantity}x ${i.productName}`,
                                                        )
                                                        .join(", ")}
                                                </p>

                                                <p className="m-0 text-xs text-foreground-muted">
                                                    <strong className="text-foreground">
                                                        Cliente:
                                                    </strong>{" "}
                                                    {order.customer
                                                        ? `${order.customer.name} (${order.customer.email})`
                                                        : `ID ${order.userId}`}{" "}
                                                    •{" "}
                                                    <strong className="text-foreground">
                                                        Entrega:
                                                    </strong>{" "}
                                                    {order.addressLabel}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                                                <div className="text-left lg:text-right">
                                                    <span className="block font-display text-base font-bold text-primary">
                                                        {formatPrice(
                                                            order.totalAmount,
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-semibold text-accent">
                                                        +{order.pointsEarned}{" "}
                                                        pts Club
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {order.status !==
                                                        "delivered" &&
                                                        order.status !==
                                                            "cancelled" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    isBusy
                                                                }
                                                                onClick={() =>
                                                                    void handleOrderStatusChange(
                                                                        order.id,
                                                                        "delivered",
                                                                    )
                                                                }
                                                                aria-label="Marcar como hecho"
                                                                title="Marcar como hecho"
                                                                className={`group inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-(--shadow-ambient-sm) transition-all duration-300 ease-out hover:px-4 hover:shadow-md disabled:opacity-60 ${focusRing}`}
                                                            >
                                                                <Check className="size-4 shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                                                                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:max-w-xs group-hover:opacity-100 group-focus-visible:max-w-xs group-focus-visible:opacity-100">
                                                                    {isBusy
                                                                        ? "Guardando..."
                                                                        : "Marcar como hecho"}
                                                                </span>
                                                            </button>
                                                        )}

                                                    {order.status ===
                                                        "pending" && (
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                void handleOrderStatusChange(
                                                                    order.id,
                                                                    "preparing",
                                                                )
                                                            }
                                                            className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-secondary bg-secondary/20 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-secondary/30 disabled:opacity-60 ${focusRing}`}
                                                        >
                                                            Pasar a cocina
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedOrder(
                                                                order,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-foreground-muted/30 bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-background-alt ${focusRing}`}
                                                    >
                                                        <Eye className="size-4 shrink-0" aria-hidden="true" />
                                                        <span>Consultar datos</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            {activeSection === "bookings" && (
                <section
                    aria-label="Gestión de reservas de mesa"
                    className="mt-6 space-y-6"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Reservas activas para hoy (
                                {getBogotaIsoDate(0)})
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-primary">
                                {bookingStats.todayConfirmed}
                            </p>
                        </div>
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Mesas confirmadas / en curso (vista actual)
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-foreground">
                                {bookingStats.activeCount}
                            </p>
                        </div>
                        <div className="rounded-xl border border-foreground-muted/15 bg-surface p-4">
                            <p className="m-0 text-xs font-semibold text-foreground-muted">
                                Comensales esperados (vista actual)
                            </p>
                            <p className="m-0 mt-1 font-display text-2xl font-bold text-accent">
                                {bookingStats.totalDinersActive} personas
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-sm)">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="m-0 font-display text-lg font-bold text-primary">
                                    Monitor de aforo por turno y ambiente
                                </h2>
                                <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                    Consulta los cupos reservados y disponibles
                                    en Salón Interior y Patio Botánico para
                                    cualquier fecha.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="occupancy-date-picker"
                                    className="text-xs font-bold text-foreground"
                                >
                                    Fecha de aforo:
                                </label>
                                <input
                                    id="occupancy-date-picker"
                                    type="date"
                                    value={occupancyDate}
                                    min={getBogotaIsoDate(0)}
                                    onChange={(e) =>
                                        setOccupancyDate(e.target.value)
                                    }
                                    className={`min-h-11 rounded-xl border border-foreground-muted/25 bg-background px-3 py-1.5 text-xs font-semibold text-foreground ${focusRing}`}
                                />
                            </div>
                        </div>

                        {isLoadingOccupancy ? (
                            <p className="mt-3 text-xs text-foreground-muted">
                                Calculando disponibilidad de mesas para{" "}
                                {occupancyDate}...
                            </p>
                        ) : (
                            dayOccupancy && (
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                        <p className="m-0 font-display text-sm font-bold text-primary">
                                            Salón Interior
                                        </p>
                                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {dayOccupancy.interior.map(
                                                (slot) => (
                                                    <div
                                                        key={`int-${slot.time}`}
                                                        className="rounded-lg border border-foreground-muted/15 bg-surface p-2.5 text-center"
                                                    >
                                                        <span className="block text-xs font-bold text-primary">
                                                            {slot.time}
                                                        </span>
                                                        <span className="mt-0.5 block text-xs text-foreground">
                                                            {
                                                                slot.reservedDiners
                                                            }
                                                            /{slot.capacity}{" "}
                                                            ocupados
                                                        </span>
                                                        <span className="block text-[11px] text-foreground-muted">
                                                            {
                                                                slot.remainingDiners
                                                            }{" "}
                                                            libres
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                        <p className="m-0 font-display text-sm font-bold text-primary">
                                            Patio Botánico
                                        </p>
                                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            {dayOccupancy.patio.map((slot) => (
                                                <div
                                                    key={`pat-${slot.time}`}
                                                    className="rounded-lg border border-foreground-muted/15 bg-surface p-2.5 text-center"
                                                >
                                                    <span className="block text-xs font-bold text-primary">
                                                        {slot.time}
                                                    </span>
                                                    <span className="mt-0.5 block text-xs text-foreground">
                                                        {slot.reservedDiners}/
                                                        {slot.capacity} ocupados
                                                    </span>
                                                    <span className="block text-[11px] text-foreground-muted">
                                                        {slot.remainingDiners}{" "}
                                                        libres
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-sm)">
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-bold text-foreground">
                                    Filtrar por días
                                </span>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {(
                                        [
                                            {
                                                id: "all",
                                                label: "Todas las fechas",
                                            },
                                            { id: "today", label: "Hoy" },
                                            { id: "tomorrow", label: "Mañana" },
                                            {
                                                id: "next7",
                                                label: "Próximos 7 días",
                                            },
                                            {
                                                id: "custom",
                                                label: "Elegir día exacto",
                                            },
                                        ] as const
                                    ).map((btn) => (
                                        <button
                                            key={btn.id}
                                            type="button"
                                            onClick={() =>
                                                setBookingDayMode(btn.id)
                                            }
                                            className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-1.5 text-xs font-bold transition ${focusRing} ${
                                                bookingDayMode === btn.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "border border-foreground-muted/25 bg-background text-foreground hover:bg-background-alt"
                                            }`}
                                        >
                                            {btn.label}
                                        </button>
                                    ))}

                                    {bookingDayMode === "custom" && (
                                        <input
                                            type="date"
                                            aria-label="Seleccionar día de reserva"
                                            value={customBookingDate}
                                            onChange={(e) => {
                                                setCustomBookingDate(
                                                    e.target.value,
                                                );
                                                if (e.target.value) {
                                                    setOccupancyDate(
                                                        e.target.value,
                                                    );
                                                }
                                            }}
                                            className={`min-h-11 rounded-xl border border-primary/40 bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground ${focusRing}`}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label
                                        htmlFor="admin-booking-search"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Buscar comensal o código
                                    </label>
                                    <input
                                        id="admin-booking-search"
                                        type="search"
                                        value={bookingSearch}
                                        onChange={(e) =>
                                            setBookingSearch(e.target.value)
                                        }
                                        placeholder="Nombre, correo o ID..."
                                        className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin-booking-sort"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Ordenar reservas
                                    </label>
                                    <select
                                        id="admin-booking-sort"
                                        value={bookingSort}
                                        onChange={(e) =>
                                            setBookingSort(
                                                e.target
                                                    .value as BookingAdminSort,
                                            )
                                        }
                                        className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="earliest">
                                            Más próximas primero (fecha y hora)
                                        </option>
                                        <option value="latest">
                                            Más lejanas / recientes primero
                                        </option>
                                        <option value="diners-desc">
                                            Mayor número de comensales
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin-booking-env"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Ambiente
                                    </label>
                                    <select
                                        id="admin-booking-env"
                                        value={bookingEnvironmentFilter}
                                        onChange={(e) =>
                                            setBookingEnvironmentFilter(
                                                e.target.value as
                                                    | EnvironmentId
                                                    | "all",
                                            )
                                        }
                                        className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="all">
                                            Todos los ambientes
                                        </option>
                                        <option value="interior">
                                            Salón Interior
                                        </option>
                                        <option value="patio">
                                            Patio Botánico
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="admin-booking-status"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Estado de la mesa
                                    </label>
                                    <select
                                        id="admin-booking-status"
                                        value={bookingStatusFilter}
                                        onChange={(e) =>
                                            setBookingStatusFilter(
                                                e.target.value as
                                                    | BookingStatus
                                                    | "all",
                                            )
                                        }
                                        className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="all">
                                            Todos los estados
                                        </option>
                                        <option value="confirmed">
                                            Confirmada
                                        </option>
                                        <option value="seated">En mesa</option>
                                        <option value="completed">
                                            Completada
                                        </option>
                                        <option value="no_show">
                                            No asistió
                                        </option>
                                        <option value="cancelled">
                                            Cancelada
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {bookingsError && (
                            <div
                                role="alert"
                                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                            >
                                <span>{bookingsError}</span>
                                <button
                                    type="button"
                                    onClick={() => void loadBookings()}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 font-bold underline ${focusRing}`}
                                >
                                    <Refresh className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Reintentar</span>
                                </button>
                            </div>
                        )}

                        {isLoadingBookings ? (
                            <p className="mt-5 text-sm text-foreground-muted">
                                Cargando agenda de reservas...
                            </p>
                        ) : filteredBookings.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-foreground-muted/15 bg-background p-6 text-center">
                                <p className="m-0 font-display text-base font-bold text-primary">
                                    No se encontraron reservas para este filtro
                                </p>
                                <p className="m-0 mt-1 text-xs text-foreground-muted">
                                    Prueba seleccionando &ldquo;Todas las
                                    fechas&rdquo; o cambiando el filtro de
                                    ambiente.
                                </p>
                            </div>
                        ) : (
                            <ul className="m-0 mt-5 list-none divide-y divide-foreground-muted/15 p-0">
                                {filteredBookings.map((booking) => {
                                    const statusMeta = getBookingStatusMeta(
                                        booking.status,
                                    );
                                    const isBusy =
                                        updatingBookingId === booking.id;
                                    const isLunch =
                                        booking.time === "13:00" ||
                                        booking.time === "14:30";

                                    return (
                                        <li
                                            key={booking.id}
                                            className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-display text-base font-bold text-primary">
                                                        {formatReadableDate(
                                                            booking.date,
                                                        )}{" "}
                                                        • {booking.time}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
                                                    >
                                                        {statusMeta.label}
                                                    </span>
                                                    <span className="rounded-md bg-background-alt px-2 py-0.5 text-xs font-semibold text-foreground">
                                                        {booking.environment ===
                                                        "interior"
                                                            ? "Salón Interior"
                                                            : "Patio Botánico"}
                                                    </span>
                                                    <span className="text-xs text-foreground-muted">
                                                        Servicio de{" "}
                                                        {isLunch
                                                            ? "Almuerzo"
                                                            : "Cena"}{" "}
                                                        • {booking.diners}{" "}
                                                        {booking.diners === 1
                                                            ? "comensal"
                                                            : "comensales"}
                                                    </span>
                                                </div>

                                                <p className="m-0 text-sm font-semibold text-foreground">
                                                    {booking.customer
                                                        ? `${booking.customer.name} (${booking.customer.email})`
                                                        : `Comensal ID: ${booking.userId}`}
                                                </p>

                                                <p className="m-0 text-xs text-foreground-muted">
                                                    Código: {booking.id}
                                                    {booking.customer
                                                        ?.dietPreference
                                                        ? ` • Preferencia: ${formatDietPreference(booking.customer.dietPreference)}`
                                                        : ""}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {booking.status ===
                                                    "confirmed" && (
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            void handleQuickBookingStatus(
                                                                booking.id,
                                                                "seated",
                                                            )
                                                        }
                                                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                                                    >
                                                        Recibir en mesa
                                                    </button>
                                                )}

                                                {booking.status ===
                                                    "seated" && (
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            void handleQuickBookingStatus(
                                                                booking.id,
                                                                "completed",
                                                            )
                                                        }
                                                        className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                                                    >
                                                        Finalizar visita
                                                    </button>
                                                )}

                                                {booking.status !==
                                                    "cancelled" &&
                                                    booking.status !==
                                                        "completed" && (
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() =>
                                                                void handleQuickBookingStatus(
                                                                    booking.id,
                                                                    "cancelled",
                                                                )
                                                            }
                                                            className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-destructive/35 px-3.5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60 ${focusRing}`}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleOpenBookingModal(
                                                            booking,
                                                        )
                                                    }
                                                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-foreground-muted/30 bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-background-alt ${focusRing}`}
                                                >
                                                    <Eye className="size-4 shrink-0" aria-hidden="true" />
                                                    <span>Ver ficha completa</span>
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            {activeSection === "products" && (
                <section
                    aria-label="Gestión del catálogo de platos"
                    className="mt-6 space-y-6"
                >
                    <div className="rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-(--shadow-ambient-sm)">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="m-0 font-display text-xl font-bold text-primary">
                                    Catálogo Gastronómico ({products.length}{" "}
                                    platos)
                                </h2>
                                <p className="m-0 mt-1 text-xs text-foreground-muted">
                                    Agrega nuevos platos con todos sus datos,
                                    edita recetas y precios, destaca el Especial
                                    del Día o marca platos agotados.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => openCreateProductModal()}
                                className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-(--shadow-ambient-sm) transition hover:opacity-90 ${focusRing}`}
                            >
                                <Add className="size-4 shrink-0" aria-hidden="true" />
                                <span>Agregar nuevo plato</span>
                            </button>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label
                                    htmlFor="admin-product-search"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Buscar plato
                                </label>
                                <input
                                    id="admin-product-search"
                                    type="search"
                                    value={productSearch}
                                    onChange={(e) =>
                                        setProductSearch(e.target.value)
                                    }
                                    placeholder="Nombre, slug o ingrediente..."
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="admin-product-category"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Categoría
                                </label>
                                <select
                                    id="admin-product-category"
                                    value={productCategoryFilter}
                                    onChange={(e) =>
                                        setProductCategoryFilter(e.target.value)
                                    }
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                >
                                    <option value="all">
                                        Todas las categorías
                                    </option>
                                    {ALL_PRODUCT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="admin-product-availability"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Disponibilidad en carta
                                </label>
                                <select
                                    id="admin-product-availability"
                                    value={productAvailabilityFilter}
                                    onChange={(e) =>
                                        setProductAvailabilityFilter(
                                            e.target.value as
                                                | "all"
                                                | "available"
                                                | "unavailable",
                                        )
                                    }
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                >
                                    <option value="all">
                                        Todos ({products.length})
                                    </option>
                                    <option value="available">
                                        Disponibles en carta
                                    </option>
                                    <option value="unavailable">
                                        Agotados / ocultos
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="admin-product-sort"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Ordenar por
                                </label>
                                <select
                                    id="admin-product-sort"
                                    value={productSort}
                                    onChange={(e) =>
                                        setProductSort(
                                            e.target.value as
                                                | "orden"
                                                | "precio-asc"
                                                | "precio-desc"
                                                | "nombre-az",
                                        )
                                    }
                                    className={`mt-1.5 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                >
                                    <option value="orden">
                                        Orden de aparición en carta
                                    </option>
                                    <option value="precio-asc">
                                        Precio: menor a mayor
                                    </option>
                                    <option value="precio-desc">
                                        Precio: mayor a menor
                                    </option>
                                    <option value="nombre-az">
                                        Nombre (A - Z)
                                    </option>
                                </select>
                            </div>
                        </div>

                        {productsError && (
                            <div
                                role="alert"
                                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                            >
                                <span>{productsError}</span>
                                <button
                                    type="button"
                                    onClick={() => void loadProducts()}
                                    className={`inline-flex cursor-pointer items-center gap-1.5 font-bold underline ${focusRing}`}
                                >
                                    <Refresh className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Reintentar</span>
                                </button>
                            </div>
                        )}

                        {isLoadingProducts ? (
                            <p className="mt-5 text-sm text-foreground-muted">
                                Cargando catálogo completo de platos...
                            </p>
                        ) : filteredProducts.length === 0 ? (
                            <div className="mt-5 rounded-xl border border-foreground-muted/15 bg-background p-6 text-center">
                                <p className="m-0 font-display text-base font-bold text-primary">
                                    No hay platos que coincidan con la búsqueda
                                </p>
                                <p className="m-0 mt-1 text-xs text-foreground-muted">
                                    Ajusta los filtros o crea un nuevo plato con
                                    el botón superior.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                {filteredProducts.map((product) => {
                                    const isAvailable =
                                        product.available !== false;
                                    const isSpecial =
                                        product.categories.includes(
                                            "Especial del Día",
                                        );
                                    const isBusy =
                                        mutatingProductId === product.id;

                                    return (
                                        <article
                                            key={product.id}
                                            className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                                                isAvailable
                                                    ? "border-foreground-muted/15 bg-background"
                                                    : "border-destructive/25 bg-background-alt/70 opacity-85"
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-foreground-muted/15 bg-surface">
                                                    <Image
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        fill
                                                        unoptimized
                                                        sizes="96px"
                                                        className="object-cover"
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <h3 className="m-0 font-display text-base font-bold text-primary">
                                                                {product.name}
                                                            </h3>
                                                            <p className="m-0 text-[11px] font-mono text-foreground-muted">
                                                                id: {product.id}{" "}
                                                                • orden #
                                                                {product.sortOrder ??
                                                                    0}
                                                            </p>
                                                        </div>
                                                        <span className="font-display text-base font-bold text-foreground">
                                                            {formatPrice(
                                                                product.price,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                                                                isAvailable
                                                                    ? "border-primary/25 bg-primary/10 text-primary"
                                                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                                            }`}
                                                        >
                                                            {isAvailable
                                                                ? "Disponible en carta"
                                                                : "Agotado / Oculto"}
                                                        </span>
                                                        {product.categories.map(
                                                            (cat) => (
                                                                <span
                                                                    key={`${product.id}-${cat}`}
                                                                    className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-foreground-muted"
                                                                >
                                                                    {cat}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>

                                                    <p className="m-0 mt-2 line-clamp-2 text-xs text-foreground-muted">
                                                        {product.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-foreground-muted/15 pt-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            void handleToggleProductAvailability(
                                                                product,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${focusRing} ${
                                                            isAvailable
                                                                ? "border-foreground-muted/30 bg-surface text-foreground hover:bg-background-alt"
                                                                : "border-primary bg-primary text-primary-foreground"
                                                        }`}
                                                    >
                                                        {isAvailable
                                                            ? "Marcar agotado"
                                                            : "Activar en carta"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            void handleToggleDailySpecial(
                                                                product,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${focusRing} ${
                                                            isSpecial
                                                                ? "border-secondary bg-secondary/25 text-foreground"
                                                                : "border-foreground-muted/25 bg-surface text-foreground-muted hover:text-foreground"
                                                        }`}
                                                    >
                                                        {isSpecial
                                                            ? "Quitar Especial"
                                                            : "Destacar Especial"}
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openCreateProductModal(
                                                                product,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/25 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground ${focusRing}`}
                                                    >
                                                        <Copy className="size-3.5 shrink-0" aria-hidden="true" />
                                                        <span>Duplicar</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditProductModal(
                                                                product,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 ${focusRing}`}
                                                    >
                                                        <Edit2 className="size-3.5 shrink-0" aria-hidden="true" />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            setProductToDelete(
                                                                product,
                                                            )
                                                        }
                                                        className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-destructive/35 px-3 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10 disabled:opacity-60 ${focusRing}`}
                                                    >
                                                        <Trash className="size-3.5 shrink-0" aria-hidden="true" />
                                                        <span>Eliminar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}
                </main>
            </div>

            {/* Mobile Bottom Navigation (fixed at bottom on < md) */}
            <nav
                role="tablist"
                aria-label="Navegación móvil del panel operativo"
                className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-foreground-muted/15 bg-surface/95 px-2 backdrop-blur-md shadow-(--shadow-ambient-md) md:hidden"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeSection === "orders"}
                    onClick={() => setActiveSection("orders")}
                    className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-bold transition ${focusRing} ${
                        activeSection === "orders"
                            ? "text-primary"
                            : "text-foreground-muted hover:text-foreground"
                    }`}
                >
                    <div className="relative">
                        <Receipt2 className="size-5 shrink-0" aria-hidden="true" />
                        <span
                            className={`absolute -top-1 -right-2.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                activeSection === "orders"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-foreground-muted/20 text-foreground"
                            }`}
                        >
                            {orders.length}
                        </span>
                    </div>
                    <span className="text-[11px]">Pedidos</span>
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeSection === "bookings"}
                    onClick={() => setActiveSection("bookings")}
                    className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-bold transition ${focusRing} ${
                        activeSection === "bookings"
                            ? "text-primary"
                            : "text-foreground-muted hover:text-foreground"
                    }`}
                >
                    <div className="relative">
                        <Calendar className="size-5 shrink-0" aria-hidden="true" />
                        <span
                            className={`absolute -top-1 -right-2.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                activeSection === "bookings"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-foreground-muted/20 text-foreground"
                            }`}
                        >
                            {bookings.length}
                        </span>
                    </div>
                    <span className="text-[11px]">Reservas</span>
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={activeSection === "products"}
                    onClick={() => setActiveSection("products")}
                    className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-bold transition ${focusRing} ${
                        activeSection === "products"
                            ? "text-primary"
                            : "text-foreground-muted hover:text-foreground"
                    }`}
                >
                    <div className="relative">
                        <ForkKnife className="size-5 shrink-0" aria-hidden="true" />
                        <span
                            className={`absolute -top-1 -right-2.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                activeSection === "products"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-foreground-muted/20 text-foreground"
                            }`}
                        >
                            {products.length}
                        </span>
                    </div>
                    <span className="text-[11px]">Catálogo</span>
                </button>
            </nav>

            {selectedOrder && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-detail-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedOrder(null);
                        }
                    }}
                >
                    <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-foreground-muted/20 bg-surface p-6 shadow-(--shadow-ambient-md)">
                        <div className="flex items-start justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                                    Expediente de Pedido • ID {selectedOrder.id}
                                </p>
                                <h2
                                    id="order-detail-title"
                                    className="m-0 mt-1 font-display text-2xl font-bold text-primary"
                                >
                                    Orden #{selectedOrder.orderNumber}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/25 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-background-alt ${focusRing}`}
                            >
                                <X className="size-4 shrink-0" aria-hidden="true" />
                                <span>Cerrar (Esc)</span>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                <h3 className="m-0 font-display text-sm font-bold text-primary">
                                    Datos del cliente
                                </h3>
                                {selectedOrder.customer ? (
                                    <dl className="m-0 mt-2 space-y-1 text-xs">
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Nombre:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedOrder.customer.name}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Correo:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedOrder.customer.email}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Usuario:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedOrder.customer
                                                    .username ?? "Sin alias"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Puntos acumulados:{" "}
                                            </dt>
                                            <dd className="inline font-semibold text-accent">
                                                {selectedOrder.customer.points}{" "}
                                                pts
                                            </dd>
                                        </div>
                                    </dl>
                                ) : (
                                    <p className="m-0 mt-2 text-xs text-foreground-muted">
                                        ID de usuario: {selectedOrder.userId}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                <h3 className="m-0 font-display text-sm font-bold text-primary">
                                    Entrega y facturación
                                </h3>
                                <dl className="m-0 mt-2 space-y-1 text-xs">
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Estado actual:{" "}
                                        </dt>
                                        <dd className="inline font-semibold text-primary">
                                            {
                                                getOrderStatusMeta(
                                                    selectedOrder.status,
                                                ).label
                                            }
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Destino:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {selectedOrder.addressLabel}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Pago:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {selectedOrder.paymentSummary}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Creado:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatDateTime(
                                                selectedOrder.createdAt,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Última actualización:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatDateTime(
                                                selectedOrder.updatedAt,
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-foreground-muted/15 bg-background p-4">
                            <h3 className="m-0 font-display text-sm font-bold text-primary">
                                Platos incluidos en la orden (
                                {selectedOrder.items.reduce(
                                    (acc, i) => acc + i.quantity,
                                    0,
                                )}{" "}
                                unidades)
                            </h3>
                            <ul className="m-0 mt-3 list-none divide-y divide-foreground-muted/15 p-0">
                                {selectedOrder.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 py-2.5 text-xs"
                                    >
                                        <div>
                                            <p className="m-0 font-bold text-foreground">
                                                {item.quantity}x{" "}
                                                {item.productName}
                                            </p>
                                            <p className="m-0 text-foreground-muted">
                                                {formatPrice(item.unitPrice)}{" "}
                                                c/u • ID plato: {item.productId}
                                            </p>
                                        </div>
                                        <span className="font-bold text-primary">
                                            {formatPrice(
                                                item.unitPrice * item.quantity,
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 flex items-center justify-between border-t border-foreground-muted/15 pt-3 text-sm font-bold">
                                <span className="text-foreground">
                                    Total del pedido (+
                                    {selectedOrder.pointsEarned} pts)
                                </span>
                                <span className="font-display text-lg text-primary">
                                    {formatPrice(selectedOrder.totalAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-foreground-muted/15 pt-4">
                            <span className="text-xs font-bold text-foreground">
                                Cambiar estado del pedido:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {(
                                    [
                                        {
                                            status: "preparing",
                                            label: "En preparación",
                                        },
                                        {
                                            status: "delivered",
                                            label: "Marcar como hecho / entregado",
                                        },
                                        {
                                            status: "cancelled",
                                            label: "Cancelar pedido",
                                        },
                                    ] as const
                                ).map((action) => (
                                    <button
                                        key={action.status}
                                        type="button"
                                        disabled={
                                            updatingOrderId ===
                                                selectedOrder.id ||
                                            selectedOrder.status ===
                                                action.status
                                        }
                                        onClick={() =>
                                            void handleOrderStatusChange(
                                                selectedOrder.id,
                                                action.status,
                                            )
                                        }
                                        className={`inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${focusRing} ${
                                            action.status === "delivered"
                                                ? "bg-primary text-primary-foreground"
                                                : action.status === "cancelled"
                                                  ? "border border-destructive/35 text-destructive hover:bg-destructive/10"
                                                  : "border border-foreground-muted/30 bg-background text-foreground hover:bg-background-alt"
                                        }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedBooking && bookingEditDraft && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-detail-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedBooking(null);
                            setBookingEditDraft(null);
                        }
                    }}
                >
                    <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-foreground-muted/20 bg-surface p-6 shadow-(--shadow-ambient-md)">
                        <div className="flex items-start justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                                    Ficha Completa de Reserva •{" "}
                                    {selectedBooking.id}
                                </p>
                                <h2
                                    id="booking-detail-title"
                                    className="m-0 mt-1 font-display text-2xl font-bold text-primary"
                                >
                                    {formatReadableDate(selectedBooking.date)} a
                                    las {selectedBooking.time}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedBooking(null);
                                    setBookingEditDraft(null);
                                }}
                                className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/25 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-background-alt ${focusRing}`}
                            >
                                <X className="size-4 shrink-0" aria-hidden="true" />
                                <span>Cerrar (Esc)</span>
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                <h3 className="m-0 font-display text-sm font-bold text-primary">
                                    Información del comensal
                                </h3>
                                {selectedBooking.customer ? (
                                    <dl className="m-0 mt-2 space-y-1.5 text-xs">
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Nombre completo:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedBooking.customer.name}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Correo:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedBooking.customer.email}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Usuario:{" "}
                                            </dt>
                                            <dd className="inline text-foreground-muted">
                                                {selectedBooking.customer
                                                    .username ?? "Sin alias"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline font-bold text-foreground">
                                                Puntos Club Casa Flora:{" "}
                                            </dt>
                                            <dd className="inline font-semibold text-accent">
                                                {
                                                    selectedBooking.customer
                                                        .points
                                                }{" "}
                                                pts
                                            </dd>
                                        </div>
                                    </dl>
                                ) : (
                                    <p className="m-0 mt-2 text-xs text-foreground-muted">
                                        ID de usuario: {selectedBooking.userId}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-xl border border-foreground-muted/15 bg-background p-4">
                                <h3 className="m-0 font-display text-sm font-bold text-primary">
                                    Perfil gastronómico para anfitrión
                                </h3>
                                <dl className="m-0 mt-2 space-y-1.5 text-xs">
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Preferencia alimentaria:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatDietPreference(
                                                selectedBooking.customer
                                                    ?.dietPreference,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Tolerancia al picante:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatSpiceTolerance(
                                                selectedBooking.customer
                                                    ?.spiceTolerance,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Momento favorito:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatFavoriteMoment(
                                                selectedBooking.customer
                                                    ?.favoriteMoment,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-bold text-foreground">
                                            Registrada el:{" "}
                                        </dt>
                                        <dd className="inline text-foreground-muted">
                                            {formatDateTime(
                                                selectedBooking.createdAt,
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-foreground-muted/15 bg-background p-4">
                            <h3 className="m-0 font-display text-sm font-bold text-primary">
                                Modificar asignación de mesa o estado
                            </h3>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="modal-booking-status"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Estado de la reserva
                                    </label>
                                    <select
                                        id="modal-booking-status"
                                        value={bookingEditDraft.status}
                                        onChange={(e) =>
                                            setBookingEditDraft((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          status: e.target
                                                              .value as BookingStatus,
                                                      }
                                                    : prev,
                                            )
                                        }
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="confirmed">
                                            Confirmada
                                        </option>
                                        <option value="seated">
                                            En mesa (Check-in realizado)
                                        </option>
                                        <option value="completed">
                                            Completada (Servicio finalizado)
                                        </option>
                                        <option value="no_show">
                                            No asistió (No-show)
                                        </option>
                                        <option value="cancelled">
                                            Cancelada
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="modal-booking-env"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Ambiente asignado
                                    </label>
                                    <select
                                        id="modal-booking-env"
                                        value={bookingEditDraft.environment}
                                        onChange={(e) =>
                                            setBookingEditDraft((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          environment: e.target
                                                              .value as EnvironmentId,
                                                      }
                                                    : prev,
                                            )
                                        }
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
                                    >
                                        <option value="interior">
                                            Salón Interior
                                        </option>
                                        <option value="patio">
                                            Patio Botánico
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="modal-booking-date"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Fecha de reserva
                                    </label>
                                    <input
                                        id="modal-booking-date"
                                        type="date"
                                        value={bookingEditDraft.date}
                                        onChange={(e) =>
                                            setBookingEditDraft((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          date: e.target.value,
                                                      }
                                                    : prev,
                                            )
                                        }
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label
                                            htmlFor="modal-booking-time"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Turno
                                        </label>
                                        <select
                                            id="modal-booking-time"
                                            value={bookingEditDraft.time}
                                            onChange={(e) =>
                                                setBookingEditDraft((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              time: e.target
                                                                  .value,
                                                          }
                                                        : prev,
                                                )
                                            }
                                            className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
                                        >
                                            {BOOKING_TIME_SLOTS.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="modal-booking-diners"
                                            className="block text-xs font-bold text-foreground"
                                        >
                                            Comensales (1-10)
                                        </label>
                                        <input
                                            id="modal-booking-diners"
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={bookingEditDraft.diners}
                                            onChange={(e) =>
                                                setBookingEditDraft((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              diners: Math.max(
                                                                  1,
                                                                  Math.min(
                                                                      10,
                                                                      Number(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      ) || 1,
                                                                  ),
                                                              ),
                                                          }
                                                        : prev,
                                                )
                                            }
                                            className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-surface px-3 py-2 text-sm text-foreground ${focusRing}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-foreground-muted/15 pt-4">
                            {selectedBooking.status !== "cancelled" ? (
                                <button
                                    type="button"
                                    disabled={
                                        updatingBookingId === selectedBooking.id
                                    }
                                    onClick={() =>
                                        void handleQuickBookingStatus(
                                            selectedBooking.id,
                                            "cancelled",
                                        )
                                    }
                                    className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border border-destructive/35 px-4 py-2 text-xs font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-60 ${focusRing}`}
                                >
                                    Cancelar esta reserva
                                </button>
                            ) : (
                                <span className="text-xs font-semibold text-destructive">
                                    Esta reserva se encuentra cancelada.
                                </span>
                            )}

                            <button
                                type="button"
                                disabled={
                                    updatingBookingId === selectedBooking.id
                                }
                                onClick={() => void handleSaveBookingDetails()}
                                className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                            >
                                <Check className="size-4 shrink-0" aria-hidden="true" />
                                <span>
                                    {updatingBookingId === selectedBooking.id
                                        ? "Guardando cambios..."
                                        : "Guardar cambios de reserva"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isProductModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="product-modal-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsProductModalOpen(false);
                        }
                    }}
                >
                    <div className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-foreground-muted/20 bg-surface p-6 shadow-(--shadow-ambient-md)">
                        <div className="flex items-start justify-between gap-4 border-b border-foreground-muted/15 pb-4">
                            <div>
                                <p className="m-0 text-xs font-bold tracking-wider text-accent uppercase">
                                    Catálogo Casa Flora • Todos los campos son
                                    obligatorios
                                </p>
                                <h2
                                    id="product-modal-title"
                                    className="m-0 mt-1 font-display text-2xl font-bold text-primary"
                                >
                                    {editingProduct
                                        ? `Editar plato: ${editingProduct.name}`
                                        : "Agregar nuevo plato al menú"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/25 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-background-alt ${focusRing}`}
                            >
                                <X className="size-4 shrink-0" aria-hidden="true" />
                                <span>Cerrar (Esc)</span>
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => void handleSubmitProductForm(e)}
                            className="mt-4 space-y-4"
                        >
                            {productFormError && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive"
                                >
                                    {productFormError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="product-form-name"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Nombre del plato *
                                    </label>
                                    <input
                                        id="product-form-name"
                                        type="text"
                                        required
                                        minLength={2}
                                        maxLength={80}
                                        value={productForm.name}
                                        onChange={(e) => {
                                            const nextName = e.target.value;
                                            setProductForm((prev) => ({
                                                ...prev,
                                                name: nextName,
                                                id:
                                                    !editingProduct &&
                                                    !idManuallyEdited
                                                        ? slugifyProductName(
                                                              nextName,
                                                          )
                                                        : prev.id,
                                            }));
                                        }}
                                        placeholder="Ej. Cazuela Andina"
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="product-form-id"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Identificador único (slug) *
                                    </label>
                                    <input
                                        id="product-form-id"
                                        type="text"
                                        required
                                        disabled={Boolean(editingProduct)}
                                        value={productForm.id}
                                        onChange={(e) => {
                                            setIdManuallyEdited(true);
                                            setProductForm((prev) => ({
                                                ...prev,
                                                id: e.target.value.toLowerCase(),
                                            }));
                                        }}
                                        placeholder="Ej. cazuela-andina"
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 font-mono text-sm text-foreground disabled:opacity-60 ${focusRing}`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="product-form-price"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Precio en COP *
                                    </label>
                                    <input
                                        id="product-form-price"
                                        type="number"
                                        required
                                        min={0}
                                        max={1000000}
                                        step={500}
                                        value={productForm.price}
                                        onChange={(e) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                price: e.target.value,
                                            }))
                                        }
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="product-form-sort"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Orden de aparición en carta *
                                    </label>
                                    <input
                                        id="product-form-sort"
                                        type="number"
                                        required
                                        min={0}
                                        max={10000}
                                        value={productForm.sortOrder}
                                        onChange={(e) =>
                                            setProductForm((prev) => ({
                                                ...prev,
                                                sortOrder: e.target.value,
                                            }))
                                        }
                                        className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <span className="block text-xs font-bold text-foreground">
                                    Categorías de la carta (selecciona de 1 a 4)
                                    *
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {ALL_PRODUCT_CATEGORIES.map((cat) => {
                                        const selected =
                                            productForm.categories.includes(
                                                cat,
                                            );
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() =>
                                                    handleToggleFormCategory(
                                                        cat,
                                                    )
                                                }
                                                className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${focusRing} ${
                                                    selected
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-foreground-muted/25 bg-background text-foreground hover:bg-background-alt"
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="product-form-description"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    Descripción gastronómica (10 a 400
                                    caracteres) *
                                </label>
                                <textarea
                                    id="product-form-description"
                                    required
                                    minLength={10}
                                    maxLength={400}
                                    rows={3}
                                    value={productForm.description}
                                    onChange={(e) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Describe los ingredientes, preparación artesanal y acompañamientos del plato..."
                                    className={`mt-1 w-full rounded-xl border border-foreground-muted/25 bg-background p-3.5 text-sm text-foreground ${focusRing}`}
                                />
                                <p className="m-0 mt-1 text-right text-[11px] text-foreground-muted">
                                    {productForm.description.trim().length} /
                                    400 caracteres
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="product-form-image"
                                    className="block text-xs font-bold text-foreground"
                                >
                                    URL de la fotografía del plato *
                                </label>
                                <input
                                    id="product-form-image"
                                    type="url"
                                    required
                                    value={productForm.imageUrl}
                                    onChange={(e) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            imageUrl: e.target.value,
                                        }))
                                    }
                                    placeholder="https://..."
                                    className={`mt-1 min-h-11 w-full rounded-xl border border-foreground-muted/25 bg-background px-3.5 py-2 text-sm text-foreground ${focusRing}`}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-foreground-muted/15 bg-background p-3.5">
                                <div>
                                    <label
                                        htmlFor="product-form-available"
                                        className="block text-xs font-bold text-foreground"
                                    >
                                        Disponibilidad inmediata en el menú
                                    </label>
                                    <p className="m-0 text-xs text-foreground-muted">
                                        Si se desactiva, el plato permanece en
                                        el catálogo pero no se muestra como
                                        disponible a los comensales.
                                    </p>
                                </div>
                                <input
                                    id="product-form-available"
                                    type="checkbox"
                                    checked={productForm.available}
                                    onChange={(e) =>
                                        setProductForm((prev) => ({
                                            ...prev,
                                            available: e.target.checked,
                                        }))
                                    }
                                    className="size-5 accent-primary"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-foreground-muted/15 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProductModalOpen(false)}
                                    className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/30 px-5 py-2 text-xs font-bold text-foreground hover:bg-background-alt ${focusRing}`}
                                >
                                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProduct}
                                    className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                                >
                                    <Check className="size-4 shrink-0" aria-hidden="true" />
                                    <span>
                                        {isSavingProduct
                                            ? "Guardando plato..."
                                            : editingProduct
                                              ? "Guardar cambios"
                                              : "Crear plato en la carta"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {productToDelete && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-product-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setProductToDelete(null);
                        }
                    }}
                >
                    <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-surface p-6 shadow-(--shadow-ambient-md)">
                        <h2
                            id="delete-product-title"
                            className="m-0 font-display text-xl font-bold text-primary"
                        >
                            ¿Eliminar &ldquo;{productToDelete.name}&rdquo;?
                        </h2>
                        <p className="mt-2 text-sm text-foreground-muted">
                            Esta acción retirará permanentemente el plato (
                            <code className="font-mono text-xs text-foreground">
                                {productToDelete.id}
                            </code>
                            ) del catálogo de Casa Flora. Si solo deseas
                            pausarlo por hoy, usa la opción &ldquo;Marcar
                            agotado&rdquo;.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setProductToDelete(null)}
                                className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-foreground-muted/30 px-4 py-2 text-xs font-bold text-foreground hover:bg-background-alt ${focusRing}`}
                            >
                                <X className="size-3.5 shrink-0" aria-hidden="true" />
                                <span>Conservar plato</span>
                            </button>
                            <button
                                type="button"
                                disabled={
                                    mutatingProductId === productToDelete.id
                                }
                                onClick={() =>
                                    void handleConfirmDeleteProduct()
                                }
                                className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-destructive px-5 py-2 text-xs font-bold text-destructive-foreground transition hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                            >
                                <Trash className="size-4 shrink-0" aria-hidden="true" />
                                <span>
                                    {mutatingProductId === productToDelete.id
                                        ? "Eliminando..."
                                        : "Sí, eliminar permanentemente"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
