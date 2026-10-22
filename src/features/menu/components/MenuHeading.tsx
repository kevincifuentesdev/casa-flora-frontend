export default function MenuHeading() {
    return (
        <section className="flex flex-col items-center px-(--spacing-margin-mobile) py-12 text-center md:px-(--spacing-margin-desktop) md:py-20">
            <h1 className="mb-6 max-w-3xl font-display text-[2.75rem] leading-9 text-primary md:text-5xl md:leading-14">
                Descubre nuestros productos
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-7 text-foreground-muted">
                En casa flora cada producto tiene su encanto, con nuestras
                selecciones de entradas, platos fuertes, bebidas y demás,
                puedes deleitar tu paladar.
            </p>
        </section>
    );
}
