"use client";

import Link from "next/link";
import { ArrowRight, Call, Clock, Sms } from "reicon-react";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const SECTIONS = [
    {
        id: "identificacion",
        title: "1. Identificación y Objeto del Servicio",
        content: (
            <>
                <p>
                    Bienvenido a Casa Flora. Estos Términos y Condiciones regulan
                    el acceso, navegación y uso de nuestra plataforma web (
                    <strong>casaflora.co</strong>) y de los servicios ofrecidos por
                    Casa Flora en la ciudad de Medellín, Antioquia, Colombia.
                </p>
                <p>
                    A través de nuestro sitio web, los usuarios pueden consultar
                    la carta gastronómica, gestionar reservas de mesa en nuestras
                    sedes, ordenar platos para entrega a domicilio o recogida en
                    local, y participar en nuestro programa de fidelización Club
                    Casa Flora.
                </p>
            </>
        ),
    },
    {
        id: "cuenta-usuario",
        title: "2. Cuentas de Usuario y Registro",
        content: (
            <>
                <p>
                    Para realizar pedidos y acceder a recompensas del Club Casa
                    Flora es necesario registrarse e iniciar sesión con una cuenta
                    válida. El usuario se compromete a proporcionar información
                    veraz, exacta y actualizada durante el registro.
                </p>
                <p>
                    Cada usuario es responsable exclusivo de mantener la
                    confidencialidad de sus credenciales de acceso. Casa Flora no
                    se hace responsable por pérdidas o daños derivados del uso no
                    autorizado de su cuenta por parte de terceros.
                </p>
            </>
        ),
    },
    {
        id: "pedidos-entregas",
        title: "3. Pedidos, Modalidades de Entrega y Límites",
        content: (
            <>
                <p>
                    Los pedidos realizados a través de la plataforma están sujetos a
                    la disponibilidad de ingredientes en cocina. Ofrecemos dos
                    modalidades de entrega:
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        <strong>Entrega a domicilio:</strong> Cobertura en barrios
                        seleccionados del Valle de Aburrá. El tiempo estimado de
                        preparación y entrega oscila entre 35 y 55 minutos según la
                        zona y las condiciones climáticas o de tráfico.
                    </li>
                    <li>
                        <strong>Recoger en el lugar:</strong> Disponible en nuestra
                        Sede El Poblado o Sede Laureles. El tiempo promedio de
                        preparación en cocina es de 20 a 30 minutos.
                    </li>
                </ul>
                <p>
                    Con el fin de garantizar la calidad artesanal de cada plato,
                    se establece un límite máximo de compra de 20 unidades por cada
                    plato por pedido. Para pedidos corporativos o de mayor volumen,
                    agradecemos comunicarse directamente con nuestro equipo de
                    atención.
                </p>
            </>
        ),
    },
    {
        id: "precios-pagos",
        title: "4. Precios, Moneda y Medios de Pago",
        content: (
            <>
                <p>
                    Todos los precios publicados en la carta están expresados en
                    pesos colombianos (COP) e incluyen los impuestos aplicables
                    conforme a la legislación colombiana vigente.
                </p>
                <p>
                    El procesamiento de pagos en línea se realiza de manera segura
                    a través de la pasarela autorizada <strong>Mercado Pago</strong>,
                    admitiendo tarjetas de crédito, débito y PSE. Casa Flora no
                    almacena números completos de tarjetas ni códigos de seguridad
                    en sus servidores.
                </p>
            </>
        ),
    },
    {
        id: "reservas",
        title: "5. Reservas de Mesa y Políticas de Asistencia",
        content: (
            <>
                <p>
                    El módulo de reservaciones permite seleccionar fecha, horario
                    (turnos de almuerzo y cena), número de comensales y el ambiente
                    deseado (Patio interior colonial o Salón principal).
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        <strong>Tolerancia:</strong> Se mantiene la reserva durante
                        15 minutos posteriores a la hora programada. Pasado este
                        tiempo, la mesa podrá ser liberada para otros clientes.
                    </li>
                    <li>
                        <strong>Cancelaciones:</strong> El usuario puede cancelar su
                        reserva sin penalidad desde su perfil hasta 2 horas antes
                        del turno previsto.
                    </li>
                    <li>
                        <strong>Aforo:</strong> Las reservas están sujetas a la
                        capacidad máxima de cada ambiente (40 personas en salón
                        interior y 24 personas en patio interior).
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "fidelizacion",
        title: "6. Club Casa Flora y Programa de Puntos",
        content: (
            <>
                <p>
                    Por cada pedido realizado con sesión iniciada y pago
                    confirmado, el usuario acumula automáticamente 1 punto por cada
                    $10.000 COP consumidos.
                </p>
                <p>
                    Los puntos acumulados son personales, intransferibles y no
                    canjeables por dinero en efectivo. Pueden ser canjeados por
                    platos de cortesía, postres de la casa o experiencias
                    especiales descritas en la sección de fidelización de la cuenta.
                </p>
            </>
        ),
    },
    {
        id: "cancelaciones-reembolsos",
        title: "7. Cancelaciones, Modificaciones y Derecho de Retracto",
        content: (
            <>
                <p>
                    En virtud de lo dispuesto en el artículo 47 de la Ley 1480 de
                    2011 (Estatuto del Consumidor en Colombia), se exceptúan del
                    derecho de retracto los contratos de suministro de bienes que,
                    por su naturaleza, sean perecederos o preparados para consumo
                    inmediato.
                </p>
                <p>
                    Si un pedido no ha entrado en preparación en cocina, el usuario
                    podrá solicitar su anulación contactando de inmediato a nuestra
                    línea de soporte. En caso de no conformidad con la calidad o
                    temperatura del plato al momento de la entrega, Casa Flora
                    procederá a la reposición o abono correspondiente previa
                    verificación.
                </p>
            </>
        ),
    },
    {
        id: "propiedad-intelectual",
        title: "8. Propiedad Intelectual",
        content: (
            <>
                <p>
                    Todos los contenidos de la plataforma web, incluyendo textos,
                    logotipos, recetas descritas, fotografías de platos, audios,
                    diseños y código fuente, son propiedad exclusiva de Casa Flora
                    o cuentan con autorización para su uso. Queda prohibida su
                    reproducción, distribución o modificación sin autorización
                    previa y expresa.
                </p>
            </>
        ),
    },
    {
        id: "contacto",
        title: "9. Atención al Cliente y Modificaciones",
        content: (
            <>
                <p>
                    Casa Flora se reserva el derecho de actualizar estos términos
                    cuando sea necesario para reflejar cambios legales u
                    operativos. Las modificaciones entrarán en vigencia a partir
                    de su publicación en el sitio web.
                </p>
                <p>
                    Para cualquier duda, felicitación, queja o solicitud de
                    información, nuestros canales oficiales son:
                </p>
                <div className="mt-3 flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <Sms className="size-4 shrink-0 text-accent" />
                        <span>contacto@casaflora.co</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Call className="size-4 shrink-0 text-accent" />
                        <span>+57 (300) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-accent" />
                        <span>Martes a Domingo: 12:00 PM a 10:00 PM</span>
                    </div>
                </div>
            </>
        ),
    },
];

export default function TermsConditionsPage() {
    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-8 pb-24 md:px-(--spacing-margin-desktop) md:py-16 md:pb-28">
            {/* Header Hero */}
            <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase dark:bg-primary/20 dark:text-primary-foreground">
                    Marco Legal
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl sm:leading-tight">
                    Términos y Condiciones
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base">
                    Última actualización: 26 de octubre de 2026. Al utilizar los
                    servicios de Casa Flora aceptas las condiciones aquí descritas
                    para garantizar una experiencia gastronómica segura y confiable.
                </p>
            </div>

            {/* Content Layout */}
            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                {/* Table of Contents (Desktop Sticky) */}
                <aside className="lg:col-span-4">
                    <div className="sticky top-24 rounded-2xl border border-foreground-muted/15 bg-surface p-5 shadow-xs">
                        <h2 className="m-0 font-display text-base font-bold text-primary">
                            Tabla de Contenido
                        </h2>
                        <nav
                            aria-label="Índice de términos y condiciones"
                            className="mt-3.5"
                        >
                            <ul className="m-0 flex flex-col gap-2 p-0 list-none">
                                {SECTIONS.map((sec) => (
                                    <li key={sec.id}>
                                        <a
                                            href={`#${sec.id}`}
                                            className={`block rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground-muted no-underline transition hover:bg-background-alt hover:text-primary ${focusRing}`}
                                        >
                                            {sec.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="mt-6 border-t border-foreground-muted/15 pt-4">
                            <p className="m-0 text-xs text-foreground-muted">
                                ¿Preguntas sobre nuestras políticas?
                            </p>
                            <a
                                href="mailto:contacto@casaflora.co"
                                className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary no-underline transition hover:text-secondary ${focusRing}`}
                            >
                                <Sms className="size-3.5" />
                                <span>Escríbenos a contacto@casaflora.co</span>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content Articles */}
                <main className="flex flex-col gap-8 lg:col-span-8">
                    {SECTIONS.map((sec) => (
                        <article
                            key={sec.id}
                            id={sec.id}
                            className="scroll-mt-24 rounded-2xl border border-foreground-muted/15 bg-surface p-6 shadow-xs sm:p-8"
                        >
                            <h2 className="m-0 font-display text-xl font-bold text-primary sm:text-2xl">
                                {sec.title}
                            </h2>
                            <div className="mt-4 text-xs leading-relaxed text-foreground sm:text-sm">
                                {sec.content}
                            </div>
                        </article>
                    ))}

                    {/* Return Navigation */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-foreground-muted/15 bg-surface p-6">
                        <div>
                            <p className="m-0 font-display text-base font-bold text-primary">
                                Conoce más sobre Casa Flora
                            </p>
                            <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                Explora nuestra carta o descubre la historia de
                                nuestra cocina.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/about-us"
                                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border border-primary/40 bg-surface px-5 py-2 text-xs font-bold text-primary no-underline transition hover:bg-background ${focusRing}`}
                            >
                                <span>Sobre Nosotros</span>
                            </Link>
                            <Link
                                href="/menu"
                                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground no-underline shadow-xs transition hover:opacity-90 ${focusRing}`}
                            >
                                <span>Ver la Carta</span>
                                <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

