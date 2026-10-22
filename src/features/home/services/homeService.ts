import { getProducts } from "@/features/products/services/productService";
import type { HomeContent, HomeState } from "../domain/home";

const FEATURED_PRODUCTS_COUNT = 3;

export const homeContent: HomeContent = {
    hero: {
        title: "Bienvenidos a Casa Flora - Donde la tradición abraza el bienestar",
        description:
            "Somos una cocina virtual nacida en Medellín para quienes creen que alimentarse bien es un placer, un detalle de amor y una obligación con uno mismo.",
        logoUrl: "/img/temp_logo.png",
    },
    story: {
        title: "Nuestra Historia, Tu Hogar",
        paragraphs: [
            "Cada receta en Casa Flora es un viaje a los domingos en casa de la abuela. Seleccionamos los ingredientes más frescos de las montañas antioqueñas para traer a tu mesa el sabor auténtico de nuestra tierra.",
            "No solo cocinamos; preservamos la memoria. Creemos en el \"slow food\", en el tiempo que toma un buen hogao en sofreír y en la paciencia que requiere una masa perfecta. Es nuestro homenaje a la tradición colombiana, adaptada para nutrir tu cuerpo y tu alma.",
        ],
        imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBLXWDKXlim2nYbdhoGqhsBl4PLZK0n_qQtbuZIUhheTcWBGkqkKB5QcWCR3Wwq7VQ4HIf3r6J700T4jqINlBwjLZZlwdiSvvb560SLeynfDZw6i1tAZvD05PV_IbhLIXSyggz2d2xAAN6xk6MEcJ1_EnSkXzKbLlUiWVXOtnLw7wotXnPkw7reEmR7yRWKJULLxZOn2udHScaelJNenlEKfX4OxTcmZNNGwzrt4FWVg6v8EqQqOAnj",
        imageAlt: "Cocina Tradicional",
    },
    showcaseTitle: "El Sabor de la Memoria",
};

export function getHomeState(): HomeState {
    return {
        content: homeContent,
        featuredProducts: getProducts().slice(0, FEATURED_PRODUCTS_COUNT),
    };
}
