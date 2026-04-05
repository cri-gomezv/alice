import React, { useEffect, useState } from 'react';
import { 
    ArrowLeftIcon, 
    LightBulbIcon, 
    UserGroupIcon, 
    ShieldCheckIcon,
    ChatBubbleBottomCenterTextIcon,
    StarIcon,
    CheckCircleIcon,
    SpeakerWaveIcon
} from '../IconComponents';

interface MortgageGuidePageProps {
  onBackToTraining: () => void;
  anchor?: string | null;
}

const narrationTexts = {
    mentalidad: `Punto 1. Mentalidad y Preparación: De Vendedor a Asesor Experto. Tu rol no es simplemente "vender un crédito"; es asesorar a una persona o familia en una de las decisiones financieras más importantes de su vida. Este cambio de mentalidad es crucial. El cliente debe percibirte como un aliado experto que lo guiará a través de un proceso complejo, no como alguien que solo busca una comisión. Antes de cualquier contacto, debes dominar: 1. El Producto B.C.I.: Conoce al detalle todas las opciones de créditos hipotecarios que ofrece B.C.I.: Tasa Fija: ¿Cuáles son los plazos disponibles (15, 20, 25, 30 años)? ¿Cuáles son los beneficios de la estabilidad en el dividendo? Tasa Mixta: ¿Cuántos años de tasa fija inicial ofrece? ¿Cómo se calcula la tasa variable posterior? ¿Para qué perfil de cliente es ideal? Tasa Variable: ¿Qué es la TAB (Tasa Activa Bancaria) y cómo afecta el dividendo? ¿Cuándo es una opción viable? Productos Asociados: Domina los seguros obligatorios (Desgravamen e Incendio/Sismo) y los voluntarios. Explícalos como una protección, no como un costo. Conoce los beneficios de contratar el Plan de Cuenta Corriente asociado al crédito. 2. El Mercado Actual: Ten a mano las tasas de interés promedio de la competencia. No para hablar mal de ellos, sino para posicionar la oferta de B.C.I. con argumentos sólidos, destacando nuestros beneficios más allá de la tasa (calidad de servicio, plazos, flexibilidad, etc.). 3. El Perfil del Cliente (Si es posible): Si es un cliente existente, revisa su historial con el banco. ¿Es un cliente de largo plazo? ¿Tiene otros productos? Esto te permitirá personalizar la conversación.`,
    procesoVenta: `2. El Script de Venta: Estructura de la Conversación. Este no es un monólogo, sino un mapa de conversación. La clave es escuchar más de lo que hablas, especialmente al principio.`,
    fase1: `Fase 1: Apertura y Conexión (Los primeros 2 minutos) El objetivo es romper el hielo y establecer un tono de confianza. Ejecutivo: "Hola [Nombre del Cliente], muy buenos días/tardes, mi nombre es [Tu Nombre], ejecutivo de cuentas de Banco B.C.I. ¿Cómo está? Lo llamo porque vi en nuestro sistema que está interesado en un crédito hipotecario / que solicitó una simulación. Me gustaría saber, ¿en qué etapa de su búsqueda se encuentra? ¿Ya tiene alguna propiedad en mente?" ¿Por qué funciona? Es directo y profesional. La pregunta abierta ("¿en qué etapa se encuentra?") lo invita a hablar y te da el control de la conversación al ponerlo a él como protagonista.`,
    fase2: `Fase 2: Diagnóstico y Descubrimiento (El Corazón de la Venta). Aquí es donde te conviertes en un asesor. Tu objetivo es entender el "sueño" del cliente y su realidad financiera para poder ofrecerle un traje a la medida. Utiliza preguntas abiertas. Preguntas sobre el Proyecto: * "Cuénteme un poco sobre la propiedad que quiere comprar. ¿Es una casa o un departamento? ¿Nuevo o usado?" * "¿Cuál es el valor aproximado de la propiedad y cuánto tiene contemplado dar de pie?" * "¿Es su primera vivienda o es una inversión?" Preguntas sobre su Situación Financiera: * "Para poder darle la mejor asesoría, necesito entender un poco su perfil. ¿Usted es trabajador dependiente o independiente?" * "¿Cuál es su renta líquida mensual promedio? Si compra con alguien más, ¿cuál es la renta de ambos?" * "¿Tiene otros créditos vigentes, como un crédito de consumo o automotriz? ¿Cuál es el monto de esas cuotas?" (Esto es clave para calcular la carga financiera). Preguntas sobre sus Expectativas y Miedos: * "¿Qué es lo más importante para usted al elegir un crédito hipotecario? ¿La cuota más baja, la estabilidad a largo plazo, la flexibilidad?" * "¿Hay algo que le preocupe de este proceso? Quizás los trámites, los plazos, o entender bien los costos."`,
    fase3: `Fase 3: Presentación de la Solución B.C.I. (El Traje a la Medida). Ahora que tienes toda la información, conectas sus necesidades con las soluciones de B.C.I. No recites características, presenta beneficios. Ejemplo 1 (Cliente busca estabilidad): Incorrecto. "Tenemos una tasa fija del 4.5% a 25 años." Correcto. "Entiendo perfectamente que su prioridad es la tranquilidad y no tener sorpresas a fin de mes. Por eso, para su perfil, la mejor opción es nuestra Tasa Fija. Con esto, su dividendo será de $XXX pesos hoy, y será exactamente el mismo en 10, 15 y 25 años más. Piense en ello como un arriendo que se congela en el tiempo, pero que al final lo convierte en dueño de su propiedad." Ejemplo 2 (Cliente joven con potencial de crecimiento en ingresos): Correcto. "Dado que usted es joven y su carrera está en pleno crecimiento, podríamos evaluar una Tasa Mixta. Le ofrecemos una tasa fija muy conveniente por los primeros 5 años, lo que le da un dividendo más bajo para empezar. Después de ese período, cuando sus ingresos probablemente sean mayores, la tasa se ajustará. Es una excelente estrategia para facilitar la compra hoy." Durante la presentación, destaca los diferenciadores de B.C.I.: * "Además, en B.C.I. nos encargamos de hacer el proceso lo más simple posible. Contamos con una plataforma digital para que pueda subir sus documentos y hacer seguimiento en línea." * "Los seguros asociados al crédito los licitamos colectivamente, lo que nos permite ofrecerle costos muy competitivos para su protección y la de su familia."`,
    manejoObjeciones: `Fase 4: Manejo de Objeciones (La Oportunidad de Demostrar Valor). Las objeciones son una señal de interés. ¡No les temas!. Objeción 1: "La tasa es un poco más alta que la de otro banco.". Respuesta: "Entiendo su punto, la tasa es un factor muy importante. Permítame preguntarle, ¿la oferta que tiene considera todos los costos? A veces una tasa ligeramente más baja esconde seguros más caros o costos operacionales que terminan encareciendo el dividendo final. En B.C.I. somos transparentes con el CAE (Carga Anual Equivalente), que es el indicador que realmente le permite comparar. Además, nuestro servicio y acompañamiento durante los 20 o 30 años del crédito marcan una gran diferencia." Objeción 2: "El pie que me piden (20%) es muy alto.". Respuesta: "Comprendo, juntar el pie es el mayor desafío. El 20% es el estándar de la industria para asegurar condiciones financieras saludables. Sin embargo, en B.C.I. evaluamos caso a caso. Si su perfil de renta y estabilidad laboral es sólido, podríamos explorar opciones para financiar hasta el 90%, aunque esto podría ajustar ligeramente la tasa. ¿Le parece si hacemos esa simulación?". Objeción 3: "Necesito tiempo para pensarlo.". Respuesta: "Por supuesto, es una decisión muy importante y debe tomarla con total seguridad. Lo que le propongo es lo siguiente: avancemos con la pre-aprobación del crédito. No tiene ningún costo ni compromiso para usted, y le permitirá tener una oferta formal de B.C.I. en sus manos. Con eso, podrá comparar con total claridad. Además, las condiciones de tasas que le ofrezco hoy podrían variar según el mercado. ¿Le parece si le envío ahora mismo la lista de documentos que necesitamos para ingresar su solicitud?".`,
    cumplimiento: "3. Criterios, Normas y Restricciones de B.C.I. (Las Reglas del Juego). Ser transparente con esto desde el principio genera confianza y evita falsas expectativas.",
    requisitos: "1. Requisitos del Solicitante. Edad: Generalmente entre 21 y 75 años (la edad más el plazo del crédito no debe superar los 80 años). Renta Mínima: Varía, pero usualmente se pide una renta líquida mínima (ej. $800.000, revisar política vigente). Se puede complementar renta entre cónyuges, convivientes civiles o incluso familiares directos (padres/hijos). Antigüedad Laboral: Mínimo 1 año para trabajadores dependientes (a veces 6 meses con continuidad laboral). Mínimo 2 años para independientes (se revisan las últimas 2 declaraciones de renta). Historial Crediticio: No tener Dicom o morosidades vigentes es un requisito indispensable. Se revisa el comportamiento de pago histórico. Nacionalidad: Chilenos o extranjeros con residencia definitiva y antigüedad laboral en Chile.",
    criterios: "2. Criterios de Financiamiento. Porcentaje de Financiamiento: La norma general es financiar un máximo del 80% del valor de la propiedad (el menor valor entre el precio de venta y la tasación que realiza el banco). Se puede llegar al 90% en casos excepcionales, sujeto a una evaluación de riesgo más estricta. Carga Financiera: El dividendo del crédito hipotecario no debe superar el 25% de la renta líquida mensual del solicitante. La suma de todas las deudas (incluyendo el nuevo hipotecario) idealmente no debe superar el 40% de la renta. Tasación de la Propiedad: Es un paso obligatorio y de costo del cliente. El banco solo prestará dinero sobre el valor que indiquen los tasadores designados por B.C.I. Es crucial explicar esto para que el cliente no se lleve sorpresas.",
    documentacion: "3. Documentación Esencial:. Cédula de identidad. Dependientes: Últimas 3 liquidaciones de sueldo, contrato de trabajo, certificado de cotizaciones de AFP de 12 meses. Independientes: Últimas 2 Declaraciones Anuales de Renta, boletas de honorarios de los últimos 6-12 meses. Documentos de la propiedad (promesa de compraventa, si la tiene).",
    estrategiasCierre: "4. Estrategias Finales para el Cierre Exitoso. Genera Urgencia (Sutil y Ética): \"Las tasas de interés están en un momento muy dinámico. Las condiciones que le ofrezco hoy se basan en el escenario actual y pueden cambiar. Asegurar su tasa con una aprobación ahora es una buena estrategia.\" Visualiza el Futuro con el Cliente: Usa un lenguaje que lo acerque a su meta. \"Imagínese, con este dividendo, en pocos meses podría estar en su nuevo hogar.\" Sé el Experto que Simplifica: Traduce la jerga financiera. Explica qué es el CAE, la Tasa de Interés, el Plazo, y cómo cada uno impacta en el dividendo. Usa la simulación como tu principal herramienta visual. El Cierre es el Comienzo: Una vez que el cliente acepta, tu trabajo de acompañamiento se intensifica. Guíalo paso a paso en la recolección de documentos, la tasación, el estudio de títulos y la firma de la escritura. Un cliente satisfecho con el proceso es tu mejor carta de recomendación."
};

const MortgageGuidePage: React.FC<MortgageGuidePageProps> = ({ onBackToTraining, anchor }) => {
    const [isNarrating, setIsNarrating] = useState(false);
    const [narratingSectionId, setNarratingSectionId] = useState<string | null>(null);

    useEffect(() => {
        if (anchor) {
            setTimeout(() => {
                const element = document.getElementById(anchor);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }

        // Cleanup function to stop narration when the component unmounts
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [anchor]);

    const handleToggleNarration = (sectionId: string, textToNarrate: string) => {
        if (!('speechSynthesis' in window)) {
            alert("Lo sentimos, tu navegador no soporta la función de texto a voz.");
            return;
        }

        if (isNarrating && narratingSectionId === sectionId) {
            window.speechSynthesis.cancel();
            setIsNarrating(false);
            setNarratingSectionId(null);
            return;
        }

        if (isNarrating) {
            window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(textToNarrate);
        utterance.lang = 'es-ES';

        utterance.onstart = () => {
            setIsNarrating(true);
            setNarratingSectionId(sectionId);
        };

        utterance.onend = () => {
            setIsNarrating(false);
            setNarratingSectionId(null);
        };
        
        utterance.onerror = () => {
            setIsNarrating(false);
            setNarratingSectionId(null);
            console.error("Ocurrió un error durante la síntesis de voz.");
        };

        window.speechSynthesis.speak(utterance);
    };

    const NarratorButton: React.FC<{ sectionId: string; text: string; }> = ({ sectionId, text }) => (
        <button
            onClick={() => handleToggleNarration(sectionId, text)}
            className={`ml-3 p-1 rounded-full transition-colors duration-200 ${narratingSectionId === sectionId ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label={`Leer en voz alta la sección ${sectionId}`}
        >
            <SpeakerWaveIcon className="h-5 w-5" />
        </button>
    );

    const ExampleBlock: React.FC<{ title: string; children: React.ReactNode; color: 'green' | 'red' }> = ({ title, children, color }) => {
        const baseClasses = 'mt-4 p-4 rounded-lg';
        const colorClasses = color === 'green'
            ? 'bg-green-50 border-l-4 border-green-400'
            : 'bg-red-50 border-l-4 border-red-400';
        const titleClasses = color === 'green' ? 'text-green-800' : 'text-red-800';
        
        return (
            <div className={`${baseClasses} ${colorClasses}`}>
                <h4 className={`font-bold ${titleClasses}`}>{title}</h4>
                <p className="text-gray-700 mt-1">{children}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
                    <button 
                        onClick={onBackToTraining}
                        className="flex items-center space-x-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span>Volver</span>
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Banco B.C.I.</p>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mt-2">Guía Completa para la Venta de Créditos Hipotecarios</h1>
                        <p className="mt-4 text-lg text-gray-600">Tu manual para convertirte en un aliado experto y ayudar a los clientes a alcanzar el sueño de su hogar. 🏡</p>
                    </div>

                    <img 
                        src="https://img.freepik.com/fotos-premium/feliz-joven-pareja-india-revisando-documentos-casa_116547-67267.jpg"
                        alt="Pareja feliz revisando documentos de su casa nueva"
                        className="w-full h-80 object-cover rounded-2xl shadow-lg mb-12"
                    />

                    <div className="space-y-12">
                        <section id="mentalidad-preparacion" className="scroll-mt-24">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <h2 className="text-3xl font-bold mb-4 flex items-center">
                                    <LightBulbIcon className="h-8 w-8 mr-3 text-yellow-500" />
                                    1. Mentalidad y Preparación: De Vendedor a Asesor Experto
                                    <NarratorButton sectionId="mentalidad" text={narrationTexts.mentalidad} />
                                </h2>
                                <p className="mb-6 text-gray-600">Tu rol no es simplemente "vender un crédito"; es asesorar a una persona o familia en una de las decisiones financieras más importantes de su vida. Este cambio de mentalidad es crucial. El cliente debe percibirte como un aliado experto que lo guiará a través de un proceso complejo, no como alguien que solo busca una comisión.</p>
                                <h3 className="font-bold text-lg text-indigo-700 mb-4">Antes de cualquier contacto, debes dominar:</h3>
                                <ol className="list-decimal list-inside space-y-4 text-gray-700">
                                    <li>
                                        <strong>El Producto B.C.I.:</strong> Conoce al detalle todas las opciones de créditos hipotecarios que ofrece B.C.I.:
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-2">
                                            <li><strong>Tasa Fija:</strong> ¿Cuáles son los plazos disponibles (15, 20, 25, 30 años)? ¿Cuáles son los beneficios de la estabilidad en el dividendo?</li>
                                            <li><strong>Tasa Mixta:</strong> ¿Cuántos años de tasa fija inicial ofrece? ¿Cómo se calcula la tasa variable posterior? ¿Para qué perfil de cliente es ideal?</li>
                                            <li><strong>Tasa Variable:</strong> ¿Qué es la TAB (Tasa Activa Bancaria) y cómo afecta el dividendo? ¿Cuándo es una opción viable?</li>
                                            <li><strong>Productos Asociados:</strong> Domina los seguros obligatorios (Desgravamen e Incendio/Sismo) y los voluntarios. Explícalos como una protección, no como un costo. Conoce los beneficios de contratar el Plan de Cuenta Corriente asociado al crédito.</li>
                                        </ul>
                                    </li>
                                    <li><strong>El Mercado Actual:</strong> Ten a mano las tasas de interés promedio de la competencia. No para hablar mal de ellos, sino para posicionar la oferta de B.C.I. con argumentos sólidos, destacando nuestros beneficios más allá de la tasa (calidad de servicio, plazos, flexibilidad, etc.).</li>
                                    <li><strong>El Perfil del Cliente (Si es posible):</strong> Si es un cliente existente, revisa su historial con el banco. ¿Es un cliente de largo plazo? ¿Tiene otros productos? Esto te permitirá personalizar la conversación.</li>
                                </ol>
                            </div>
                        </section>

                        <section id="proceso-venta" className="scroll-mt-24">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                 <h2 className="text-3xl font-bold mb-4 flex items-center">
                                     <UserGroupIcon className="h-8 w-8 mr-3 text-sky-500" />
                                     2. El Script de Venta: Estructura de la Conversación
                                     <NarratorButton sectionId="procesoVenta" text={narrationTexts.procesoVenta} />
                                 </h2>
                                <p className="mb-6 text-gray-600">Este no es un monólogo, sino un mapa de conversación. La clave es escuchar más de lo que hablas, especialmente al principio.</p>
                                
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-indigo-800 border-b pb-2 mb-3 flex items-center">
                                            Fase 1: Apertura y Conexión (Los primeros 2 minutos)
                                            <NarratorButton sectionId="fase1" text={narrationTexts.fase1} />
                                        </h3>
                                        <p className="mb-2 text-gray-600">El objetivo es romper el hielo y establecer un tono de confianza.</p>
                                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-4">
                                            <strong>Ejecutivo:</strong> "Hola [Nombre del Cliente], muy buenos días/tardes, mi nombre es [Tu Nombre], ejecutivo de cuentas de Banco B.C.I. ¿Cómo está? Lo llamo porque vi en nuestro sistema que está interesado en un crédito hipotecario / que solicitó una simulación. Me gustaría saber, ¿en qué etapa de su búsqueda se encuentra? ¿Ya tiene alguna propiedad en mente?"
                                        </blockquote>
                                        <div className="mt-3">
                                            <h4 className="font-semibold text-gray-800">¿Por qué funciona?</h4>
                                            <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                                                <li>Es directo y profesional.</li>
                                                <li>La pregunta abierta ("¿en qué etapa se encuentra?") lo invita a hablar y te da el control de la conversación al ponerlo a él como protagonista.</li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-semibold text-indigo-800 border-b pb-2 mb-3 flex items-center">
                                            Fase 2: Diagnóstico y Descubrimiento (El Corazón de la Venta)
                                            <NarratorButton sectionId="fase2" text={narrationTexts.fase2} />
                                        </h3>
                                        <p className="mb-4 text-gray-600">Aquí es donde te conviertes en un asesor. Tu objetivo es entender el "sueño" del cliente y su realidad financiera para poder ofrecerle un traje a la medida. Utiliza preguntas abiertas.</p>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Preguntas sobre el Proyecto:</h4>
                                                <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                                                    <li>"Cuénteme un poco sobre la propiedad que quiere comprar. ¿Es una casa o un departamento? ¿Nuevo o usado?"</li>
                                                    <li>"¿Cuál es el valor aproximado de la propiedad y cuánto tiene contemplado dar de pie?"</li>
                                                    <li>"¿Es su primera vivienda o es una inversión?"</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Preguntas sobre su Situación Financiera:</h4>
                                                 <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                                                    <li>"Para poder darle la mejor asesoría, necesito entender un poco su perfil. ¿Usted es trabajador dependiente o independiente?"</li>
                                                    <li>"¿Cuál es su renta líquida mensual promedio? Si compra con alguien más, ¿cuál es la renta de ambos?"</li>
                                                    <li>"¿Tiene otros créditos vigentes, como un crédito de consumo o automotriz? ¿Cuál es el monto de esas cuotas?" (Esto es clave para calcular la carga financiera).</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Preguntas sobre sus Expectativas y Miedos:</h4>
                                                <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                                                    <li>"¿Qué es lo más importante para usted al elegir un crédito hipotecario? ¿La cuota más baja, la estabilidad a largo plazo, la flexibilidad?"</li>
                                                    <li>"¿Hay algo que le preocupe de este proceso? Quizás los trámites, los plazos, o entender bien los costos."</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-indigo-800 border-b pb-2 mb-3 flex items-center">
                                            Fase 3: Presentación de la Solución B.C.I. (El Traje a la Medida)
                                            <NarratorButton sectionId="fase3" text={narrationTexts.fase3} />
                                        </h3>
                                        <p className="mb-4 text-gray-600">Ahora que tienes toda la información, conectas sus necesidades con las soluciones de B.C.I. No recites características, presenta beneficios.</p>
                                        <h4 className="font-semibold text-gray-800 mb-2">Ejemplo 1 (Cliente busca estabilidad):</h4>
                                        <ExampleBlock title="Incorrecto ❌" color="red">
                                            "Tenemos una tasa fija del 4.5% a 25 años."
                                        </ExampleBlock>
                                        <ExampleBlock title="Correcto ✅" color="green">
                                            "Entiendo perfectamente que su prioridad es la tranquilidad y no tener sorpresas a fin de mes. Por eso, para su perfil, la mejor opción es nuestra Tasa Fija. Con esto, su dividendo será de $XXX pesos hoy, y será exactamente el mismo en 10, 15 y 25 años más. Piense en ello como un arriendo que se congela en el tiempo, pero que al final lo convierte en dueño de su propiedad."
                                        </ExampleBlock>

                                        <h4 className="font-semibold text-gray-800 mt-6 mb-2">Ejemplo 2 (Cliente joven con potencial de crecimiento en ingresos):</h4>
                                        <ExampleBlock title="Correcto ✅" color="green">
                                            "Dado que usted es joven y su carrera está en pleno crecimiento, podríamos evaluar una Tasa Mixta. Le ofrecemos una tasa fija muy conveniente por los primeros 5 años, lo que le da un dividendo más bajo para empezar. Después de ese período, cuando sus ingresos probablemente sean mayores, la tasa se ajustará. Es una excelente estrategia para facilitar la compra hoy."
                                        </ExampleBlock>

                                        <h4 className="font-semibold text-gray-800 mt-6 mb-2">Durante la presentación, destaca los diferenciadores de B.C.I.:</h4>
                                         <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                                            <li>"Además, en B.C.I. nos encargamos de hacer el proceso lo más simple posible. Contamos con una plataforma digital para que pueda subir sus documentos y hacer seguimiento en línea."</li>
                                            <li>"Los seguros asociados al crédito los licitamos colectivamente, lo que nos permite ofrecerle costos muy competitivos para su protección y la de su familia."</li>
                                        </ul>
                                    </div>
                                    
                                    <div id="manejo-objeciones" className="scroll-mt-24">
                                         <h3 className="text-xl font-semibold text-indigo-800 border-b pb-2 mb-3 flex items-center">
                                             <ChatBubbleBottomCenterTextIcon className="h-6 w-6 mr-2" />
                                             Fase 4: Manejo de Objeciones (La Oportunidad de Demostrar Valor)
                                             <NarratorButton sectionId="manejoObjeciones" text={narrationTexts.manejoObjeciones} />
                                         </h3>
                                         <p className="mb-4 text-gray-600">Las objeciones son una señal de interés. ¡No les temas!</p>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">Objeción 1: "La tasa es un poco más alta que la de otro banco."</p>
                                                <p className="text-gray-600 mt-1"><strong>Respuesta:</strong> "Entiendo su punto, la tasa es un factor muy importante. Permítame preguntarle, ¿la oferta que tiene considera todos los costos? A veces una tasa ligeramente más baja esconde seguros más caros o costos operacionales que terminan encareciendo el dividendo final. En B.C.I. somos transparentes con el CAE (Carga Anual Equivalente), que es el indicador que realmente le permite comparar. Además, nuestro servicio y acompañamiento durante los 20 o 30 años del crédito marcan una gran diferencia."</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Objeción 2: "El pie que me piden (20%) es muy alto."</p>
                                                <p className="text-gray-600 mt-1"><strong>Respuesta:</strong> "Comprendo, juntar el pie es el mayor desafío. El 20% es el estándar de la industria para asegurar condiciones financieras saludables. Sin embargo, en B.C.I. evaluamos caso a caso. Si su perfil de renta y estabilidad laboral es sólido, podríamos explorar opciones para financiar hasta el 90%, aunque esto podría ajustar ligeramente la tasa. ¿Le parece si hacemos esa simulación?"</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Objeción 3: "Necesito tiempo para pensarlo."</p>
                                                <p className="text-gray-600 mt-1"><strong>Respuesta:</strong> "Por supuesto, es una decisión muy importante y debe tomarla con total seguridad. Lo que le propongo es lo siguiente: avancemos con la pre-aprobación del crédito. No tiene ningún costo ni compromiso para usted, y le permitirá tener una oferta formal de B.C.I. en sus manos. Con eso, podrá comparar con total claridad. Además, las condiciones de tasas que le ofrezco hoy podrían variar según el mercado. ¿Le parece si le envío ahora mismo la lista de documentos que necesitamos para ingresar su solicitud?"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="cumplimiento" className="scroll-mt-24">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <h2 className="text-3xl font-bold mb-4 flex items-center">
                                    <ShieldCheckIcon className="h-8 w-8 mr-3 text-green-500" />
                                    3. Criterios, Normas y Restricciones de B.C.I. (Las Reglas del Juego)
                                    <NarratorButton sectionId="cumplimiento" text={narrationTexts.cumplimiento} />
                                </h2>
                                 <p className="mb-6 text-gray-600">Ser transparente con esto desde el principio genera confianza y evita falsas expectativas.</p>
                                 <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-indigo-700 flex items-center">
                                            1. Requisitos del Solicitante:
                                            <NarratorButton sectionId="requisitos" text={narrationTexts.requisitos} />
                                        </h3>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-700">
                                            <li><strong>Edad:</strong> Generalmente entre 21 y 75 años (la edad más el plazo del crédito no debe superar los 80 años).</li>
                                            <li><strong>Renta Mínima:</strong> Varía, pero usualmente se pide una renta líquida mínima (ej. $800.000, revisar política vigente). Se puede complementar renta entre cónyuges, convivientes civiles o incluso familiares directos (padres/hijos).</li>
                                            <li><strong>Antigüedad Laboral:</strong> Mínimo 1 año para trabajadores dependientes (a veces 6 meses con continuidad laboral). Mínimo 2 años para independientes (se revisan las últimas 2 declaraciones de renta).</li>
                                            <li><strong>Historial Crediticio:</strong> No tener Dicom o morosidades vigentes es un requisito indispensable. Se revisa el comportamiento de pago histórico.</li>
                                            <li><strong>Nacionalidad:</strong> Chilenos o extranjeros con residencia definitiva y antigüedad laboral en Chile.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-indigo-700 flex items-center">
                                            2. Criterios de Financiamiento:
                                            <NarratorButton sectionId="criterios" text={narrationTexts.criterios} />
                                        </h3>
                                         <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-700">
                                            <li><strong>Porcentaje de Financiamiento:</strong> La norma general es financiar un máximo del 80% del valor de la propiedad (el menor valor entre el precio de venta y la tasación que realiza el banco). Se puede llegar al 90% en casos excepcionales, sujeto a una evaluación de riesgo más estricta.</li>
                                            <li><strong>Carga Financiera:</strong> El dividendo del crédito hipotecario no debe superar el 25% de la renta líquida mensual del solicitante. La suma de todas las deudas (incluyendo el nuevo hipotecario) idealmente no debe superar el 40% de la renta.</li>
                                            <li><strong>Tasación de la Propiedad:</strong> Es un paso obligatorio y de costo del cliente. El banco solo prestará dinero sobre el valor que indiquen los tasadores designados por B.C.I. Es crucial explicar esto para que el cliente no se lleve sorpresas.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-indigo-700 flex items-center">
                                            3. Documentación Esencial:
                                            <NarratorButton sectionId="documentacion" text={narrationTexts.documentacion} />
                                        </h3>
                                        <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-gray-700">
                                            <li>Cédula de identidad.</li>
                                            <li><strong>Dependientes:</strong> Últimas 3 liquidaciones de sueldo, contrato de trabajo, certificado de cotizaciones de AFP de 12 meses.</li>
                                            <li><strong>Independientes:</strong> Últimas 2 Declaraciones Anuales de Renta, boletas de honorarios de los últimos 6-12 meses.</li>
                                            <li>Documentos de la propiedad (promesa de compraventa, si la tiene).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        <section id="estrategias-cierre" className="scroll-mt-24">
                            <div className="bg-white p-8 rounded-xl shadow-lg">
                                <h2 className="text-3xl font-bold mb-4 flex items-center">
                                    <StarIcon className="h-8 w-8 mr-3 text-amber-500" />
                                    4. Estrategias Finales para el Cierre Exitoso
                                    <NarratorButton sectionId="estrategiasCierre" text={narrationTexts.estrategiasCierre} />
                                </h2>
                                <ul className="space-y-4 mt-6">
                                    <li className="flex items-start">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Genera Urgencia (Sutil y Ética):</h3>
                                            <p className="text-gray-600">"Las tasas de interés están en un momento muy dinámico. Las condiciones que le ofrezco hoy se basan en el escenario actual y pueden cambiar. Asegurar su tasa con una aprobación ahora es una buena estrategia."</p>
                                        </div>
                                    </li>
                                     <li className="flex items-start">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Visualiza el Futuro con el Cliente:</h3>
                                            <p className="text-gray-600">Usa un lenguaje que lo acerque a su meta. "Imagínese, con este dividendo, en pocos meses podría estar en su nuevo hogar."</p>
                                        </div>
                                    </li>
                                     <li className="flex items-start">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Sé el Experto que Simplifica:</h3>
                                            <p className="text-gray-600">Traduce la jerga financiera. Explica qué es el CAE, la Tasa de Interés, el Plazo, y cómo cada uno impacta en el dividendo. Usa la simulación como tu principal herramienta visual.</p>
                                        </div>
                                    </li>
                                     <li className="flex items-start">
                                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">El Cierre es el Comienzo:</h3>
                                            <p className="text-gray-600">Una vez que el cliente acepta, tu trabajo de acompañamiento se intensifica. Guíalo paso a paso en la recolección de documentos, la tasación, el estudio de títulos y la firma de la escritura. Un cliente satisfecho con el proceso es tu mejor carta de recomendación.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MortgageGuidePage;