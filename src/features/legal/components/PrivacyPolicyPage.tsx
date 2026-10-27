"use client";

import Link from "next/link";
import { ArrowRight, Call, Clock, Sms } from "reicon-react";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const SECTIONS = [
    {
        id: "responsable",
        title: "1. Responsable del Tratamiento",
        content: (
            <>
                <p>
                    Casa Flora, con operación principal en la ciudad de Medellín,
                    Antioquia, Colombia, actúa como Responsable del Tratamiento de
                    los datos personales recolectados a través de la plataforma web{" "}
                    <strong>casaflora.co</strong>, en estricto cumplimiento de la
                    Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 y demás
                    normas concordantes sobre protección de datos personales
                    (Habeas Data).
                </p>
                <p>
                    Canal oficial para atención de requerimientos de privacidad y
                    datos personales: <strong>contacto@casaflora.co</strong>.
                </p>
            </>
        ),
    },
    {
        id: "datos-recolectados",
        title: "2. Información que Recolectamos",
        content: (
            <>
                <p>
                    Para prestar adecuadamente nuestros servicios gastronómicos, de
                    reserva y de entrega, recolectamos las siguientes categorías de
                    información:
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        <strong>Datos de identificación y contacto:</strong> Nombres,
                        apellidos, correo electrónico, fecha de nacimiento, nombre
                        de usuario y teléfono de contacto.
                    </li>
                    <li>
                        <strong>Datos de entrega y ubicación:</strong> Direcciones de
                        residencia o trabajo, barrios del Valle de Aburrá, detalles
                        de acceso y notas para el repartidor.
                    </li>
                    <li>
                        <strong>Preferencias gastronómicas:</strong> Respuestas al
                        cuestionario de bienvenida (gustos de sazón, tolerancia al
                        picante, momentos favoritos y dietas tradicionales o
                        vegetales) empleadas para personalizar sugerencias de platos.
                    </li>
                    <li>
                        <strong>Datos de reservas:</strong> Fecha, hora, sede
                        elegida, ambiente de preferencia y número de comensales.
                    </li>
                    <li>
                        <strong>Datos transaccionales:</strong> Historial de pedidos
                        y acumulación de puntos en el Club Casa Flora. Los pagos son
                        procesados externamente por Mercado Pago bajo estándares
                        PCI-DSS; Casa Flora no almacena datos de tarjetas ni códigos
                        CVV.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "finalidad",
        title: "3. Finalidad del Tratamiento de Datos",
        content: (
            <>
                <p>
                    Los datos personales recopilados se utilizan exclusivamente
                    para las siguientes finalidades legítimas:
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        Gestionar el registro, autenticación y mantenimiento de su
                        cuenta de usuario.
                    </li>
                    <li>
                        Procesar, preparar y coordinar la entrega de sus pedidos a
                        domicilio o recogida en local.
                    </li>
                    <li>
                        Administrar y confirmar sus reservaciones de mesa en
                        nuestras sedes de El Poblado y Laureles.
                    </li>
                    <li>
                        Calcular, acumular y permitir el canje de puntos y
                        recompensas artesanales en el Club Casa Flora.
                    </li>
                    <li>
                        Adaptar las recomendaciones de la carta según sus
                        preferencias y restricciones alimentarias informadas.
                    </li>
                    <li>
                        Atender peticiones, quejas, reclamos o sugerencias a través
                        de nuestros canales de servicio al cliente.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "derechos",
        title: "4. Derechos de los Titulares (Habeas Data)",
        content: (
            <>
                <p>
                    De acuerdo con la legislación colombiana aplicable, todo titular
                    de datos personales tiene los siguientes derechos:
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        <strong>Conocer, actualizar y rectificar:</strong> Sus datos
                        personales frente a datos parciales, inexactos, incompletos o
                        que induzcan a error.
                    </li>
                    <li>
                        <strong>Solicitar prueba de la autorización:</strong> Otorgada
                        para el tratamiento de su información.
                    </li>
                    <li>
                        <strong>Ser informado:</strong> Previa solicitud, sobre el
                        uso que se ha dado a sus datos personales.
                    </li>
                    <li>
                        <strong>Revocar la autorización o suprimir el dato:</strong>{" "}
                        Cuando en el tratamiento no se respeten los principios,
                        derechos y garantías constitucionales y legales.
                    </li>
                    <li>
                        <strong>Presentar quejas:</strong> Ante la Superintendencia
                        de Industria y Comercio (SIC) por infracciones a la ley de
                        protección de datos.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "seguridad",
        title: "5. Seguridad y Confidencialidad",
        content: (
            <>
                <p>
                    Casa Flora implementa medidas técnicas, humanas y
                    administrativas razonables para resguardar la seguridad de la
                    información, previniendo su adulteración, pérdida, consulta, uso
                    o acceso no autorizado.
                </p>
                <p>
                    Toda comunicación entre el navegador del usuario y nuestros
                    servidores se realiza mediante protocolos seguros y cifrados
                    (HTTPS/TLS). Las contraseñas de acceso se almacenan utilizando
                    algoritmos de hash criptográfico unidireccionales de alta
                    seguridad.
                </p>
            </>
        ),
    },
    {
        id: "cookies",
        title: "6. Almacenamiento Local y Cookies",
        content: (
            <>
                <p>
                    Utilizamos almacenamiento local en el navegador (
                    <em>localStorage</em> y cookies de sesión estrictamente
                    necesarias) para:
                </p>
                <ul className="my-2 list-disc pl-5 space-y-1">
                    <li>
                        Mantener activa su sesión de usuario de forma segura mientras
                        navega en la plataforma.
                    </li>
                    <li>
                        Conservar los platos seleccionados en la bolsa de compras
                        para evitar que se pierdan al navegar entre páginas.
                    </li>
                    <li>
                        Guardar temporalmente el paso actual del cuestionario de
                        bienvenida culinaria.
                    </li>
                </ul>
                <p>
                    No comercializamos ni compartimos información de navegación con
                    redes de publicidad de terceros para perfilamiento comercial.
                </p>
            </>
        ),
    },
    {
        id: "procedimiento",
        title: "7. Procedimiento para Consultas y Reclamos",
        content: (
            <>
                <p>
                    Para ejercer sus derechos de consulta, actualización,
                    rectificación o supresión de datos, puede enviar una solicitud
                    escrita al correo electrónico:
                </p>
                <div className="mt-3 flex flex-col gap-2 rounded-xl border border-foreground-muted/15 bg-background p-4 text-xs">
                    <div className="flex items-center gap-2">
                        <Sms className="size-4 shrink-0 text-accent" />
                        <span className="font-bold">contacto@casaflora.co</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Call className="size-4 shrink-0 text-accent" />
                        <span>+57 (300) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-accent" />
                        <span>Respuesta en un plazo máximo de 10 días hábiles</span>
                    </div>
                </div>
                <p className="mt-3">
                    Su solicitud debe incluir su nombre completo, documento de
                    identidad, descripción clara de los hechos y datos de contacto
                    para remitir la respuesta formal.
                </p>
            </>
        ),
    },
    {
        id: "vigencia",
        title: "8. Vigencia y Modificaciones",
        content: (
            <>
                <p>
                    La presente Política de Privacidad rige a partir del 26 de
                    octubre de 2026. Las bases de datos tendrán una vigencia
                    equivalente al tiempo en que se mantengan las finalidades para
                    las cuales fueron recolectadas o el término legal exigible.
                </p>
                <p>
                    Cualquier cambio sustancial en estas políticas será informado a
                    los usuarios a través de la plataforma web antes de su entrada
                    en vigor.
                </p>
            </>
        ),
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto w-full max-w-(--container-max) px-(--spacing-margin-mobile) py-8 pb-24 md:px-(--spacing-margin-desktop) md:py-16 md:pb-28">
            {/* Header Hero */}
            <div className="mx-auto max-w-3xl text-center">
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase dark:bg-primary/20 dark:text-primary-foreground">
                    Protección de Datos
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-5xl sm:leading-tight">
                    Política de Privacidad
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-foreground-muted sm:text-base">
                    En Casa Flora valoramos su confianza y protegemos su
                    información personal conforme a la Ley 1581 de 2012 de Habeas
                    Data en Colombia. Conozca cómo cuidamos y tratamos sus datos.
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
                            aria-label="Índice de la política de privacidad"
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
                                ¿Deseas ejercer tus derechos de Habeas Data?
                            </p>
                            <a
                                href="mailto:contacto@casaflora.co"
                                className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary no-underline transition hover:text-secondary ${focusRing}`}
                            >
                                <Sms className="size-3.5" />
                                <span>contacto@casaflora.co</span>
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

                    {/* Navigation Footer Card */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-foreground-muted/15 bg-surface p-6">
                        <div>
                            <p className="m-0 font-display text-base font-bold text-primary">
                                Términos Legales Relacionados
                            </p>
                            <p className="m-0 mt-0.5 text-xs text-foreground-muted">
                                Consulta también nuestras condiciones de servicio y
                                reservas.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/terms-conditions"
                                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border border-primary/40 bg-surface px-5 py-2 text-xs font-bold text-primary no-underline transition hover:bg-background ${focusRing}`}
                            >
                                <span>Términos y Condiciones</span>
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
