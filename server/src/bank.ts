// Banco de preguntas generado desde workspace/quiz-totalsec/banco-100-preguntas.md
// 90 preguntas completas (legislación mexicana). La categoría Totalsec NO está aquí:
// sus datos reales están pendientes y se agregan desde la app (tabla custom_questions).

export type BankQuestion = {
  id: number;
  category: string;
  difficulty: "Fácil" | "Media" | "Difícil";
  points: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

export const BANK: BankQuestion[] = [
 {
  "id": 1,
  "category": "Derecho básico",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué protege el artículo 16 de la Constitución?",
  "options": [
   "La libertad de expresión",
   "La protección de los datos personales",
   "El derecho a la educación",
   "La propiedad privada"
  ],
  "correct": 1,
  "explanation": "El art. 16 reconoce el derecho a la protección de datos personales y los derechos ARCO."
 },
 {
  "id": 2,
  "category": "Derecho básico",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es una ley?",
  "options": [
   "Una recomendación sin sanción",
   "Una norma obligatoria emitida por el Poder Legislativo",
   "Un contrato entre particulares",
   "Una costumbre"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 3,
  "category": "Derecho básico",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Cuáles son los derechos ARCO?",
  "options": [
   "Acceso, Rectificación, Cancelación y Oposición",
   "Acción, Revisión, Cobro y Obligación",
   "Aceptación, Rechazo, Cambio y Oferta",
   "Acceso, Registro, Control y Orden"
  ],
  "correct": 0,
  "explanation": "Están en el art. 16 constitucional y en la LFPDPPP."
 },
 {
  "id": 4,
  "category": "Derecho básico",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué significa que la Constitución es la norma suprema?",
  "options": [
   "Que solo aplica al gobierno federal",
   "Que ninguna ley o acto puede contradecirla",
   "Que se puede ignorar si hay un contrato",
   "Que solo aplica en la CDMX"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 5,
  "category": "Derecho básico",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es el juicio de amparo?",
  "options": [
   "Un juicio para cobrar deudas",
   "Un medio para proteger derechos humanos frente a actos de autoridad",
   "Un juicio laboral",
   "Un trámite notarial"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 6,
  "category": "Derecho básico",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué diferencia hay entre un derecho y una garantía?",
  "options": [
   "No hay diferencia",
   "El derecho es el bien protegido y la garantía es el medio procesal para protegerlo",
   "La garantía es más importante",
   "El derecho solo aplica a empresas"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 7,
  "category": "Derecho básico",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué principio impide aplicar una ley de forma retroactiva en perjuicio de una persona?",
  "options": [
   "Principio de legalidad y no retroactividad, art. 14 constitucional",
   "Principio de igualdad",
   "Principio de libre competencia",
   "Principio de buena fe"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 8,
  "category": "Derecho básico",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Quiénes son sujetos obligados a respetar los derechos humanos?",
  "options": [
   "Solo los particulares",
   "Solo las empresas",
   "Todas las autoridades, en el ámbito de su competencia",
   "Solo los jueces"
  ],
  "correct": 2,
  "explanation": "Art. 1 constitucional."
 },
 {
  "id": 9,
  "category": "Derecho corporativo",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué ley regula las sociedades mercantiles en México?",
  "options": [
   "Código Civil Federal",
   "Ley General de Sociedades Mercantiles",
   "Ley Federal del Trabajo",
   "Código de Comercio, únicamente"
  ],
  "correct": 1,
  "explanation": "LGSM."
 },
 {
  "id": 10,
  "category": "Derecho corporativo",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué significa S.A. de C.V.?",
  "options": [
   "Sociedad Anónima de Capital Variable",
   "Sociedad Asociada de Capital Voluntario",
   "Sociedad Anónima de Comercio Virtual",
   "Sociedad de Accionistas Variables"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 11,
  "category": "Derecho corporativo",
  "difficulty": "Media",
  "points": 10,
  "text": "En una S.A., ¿cómo se divide el capital?",
  "options": [
   "En partes sociales",
   "En acciones",
   "En cuotas",
   "En participaciones indivisibles"
  ],
  "correct": 1,
  "explanation": "En la S. de R.L. se divide en partes sociales."
 },
 {
  "id": 12,
  "category": "Derecho corporativo",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Cuál es el máximo de socios en una S. de R.L.?",
  "options": [
   "10",
   "25",
   "50",
   "100"
  ],
  "correct": 2,
  "explanation": "Art. 61 LGSM."
 },
 {
  "id": 13,
  "category": "Derecho corporativo",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un conflicto de interés en una empresa?",
  "options": [
   "Un desacuerdo sobre el horario",
   "Cuando el interés personal de un directivo o socio choca con el interés de la sociedad",
   "Una pelea entre empleados",
   "Un error contable"
  ],
  "correct": 1,
  "explanation": "Debe revelarse y, en su caso, abstenerse de votar."
 },
 {
  "id": 14,
  "category": "Derecho corporativo",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es el gobierno corporativo?",
  "options": [
   "Solo el consejo de administración",
   "El conjunto de reglas y prácticas para dirigir y controlar una sociedad con transparencia y rendición de cuentas",
   "La contabilidad de la empresa",
   "El área de recursos humanos"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 15,
  "category": "Derecho corporativo",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué responsabilidad tienen los socios de una S.A.?",
  "options": [
   "Ilimitada, con todo su patrimonio",
   "Limitada hasta el monto de su aportación",
   "Ninguna",
   "Solo si son administradores"
  ],
  "correct": 1,
  "explanation": "Por eso es clave para limitar riesgo."
 },
 {
  "id": 16,
  "category": "Derecho corporativo",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es una SAS?",
  "options": [
   "Sociedad por Acciones Simplificada, que se puede constituir por una sola persona y en línea",
   "Sociedad Anónima Simple",
   "Sociedad de Accionistas Solidarios",
   "Sociedad Anónima de Servicios"
  ],
  "correct": 0,
  "explanation": "Arts. 260 y siguientes LGSM."
 },
 {
  "id": 17,
  "category": "Derecho corporativo",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué documento es la base de una sociedad?",
  "options": [
   "El aviso de privacidad",
   "El acta constitutiva y los estatutos sociales",
   "Un contrato de trabajo",
   "Una factura"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 18,
  "category": "Propiedad intelectual",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué institución registra marcas y patentes en México?",
  "options": [
   "INDAUTOR",
   "IMPI",
   "INAI",
   "SAT"
  ],
  "correct": 1,
  "explanation": "Instituto Mexicano de la Propiedad Industrial."
 },
 {
  "id": 19,
  "category": "Propiedad intelectual",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué protege una marca?",
  "options": [
   "Una invención técnica",
   "El signo que distingue productos o servicios de otros",
   "Una obra literaria",
   "Un secreto comercial, únicamente"
  ],
  "correct": 1,
  "explanation": "Ley Federal de Protección a la Propiedad Industrial."
 },
 {
  "id": 20,
  "category": "Propiedad intelectual",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Cuánto dura el registro de una marca en México?",
  "options": [
   "5 años",
   "10 años, renovable",
   "20 años",
   "Para siempre sin renovar"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 21,
  "category": "Propiedad intelectual",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Cuánto dura una patente en México?",
  "options": [
   "10 años",
   "15 años",
   "20 años improrrogables",
   "50 años"
  ],
  "correct": 2,
  "explanation": ""
 },
 {
  "id": 22,
  "category": "Propiedad intelectual",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué protege el derecho de autor?",
  "options": [
   "Ideas en general",
   "Obras literarias, artísticas y científicas ya expresadas, no las ideas sueltas",
   "Marcas",
   "Patentes"
  ],
  "correct": 1,
  "explanation": "Ley Federal del Derecho de Autor, INDAUTOR."
 },
 {
  "id": 23,
  "category": "Propiedad intelectual",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es un secreto industrial?",
  "options": [
   "Cualquier dato de la empresa",
   "Información confidencial con valor comercial que la empresa protege con medidas razonables para mantenerla secreta",
   "Un dato público",
   "Una patente vencida"
  ],
  "correct": 1,
  "explanation": "LFPPI, arts. sobre secreto industrial."
 },
 {
  "id": 24,
  "category": "Propiedad intelectual",
  "difficulty": "Difícil",
  "points": 15,
  "text": "Si un empleado firma un NDA y luego revela el código fuente de Totalsec, ¿qué puede pasar?",
  "options": [
   "Nada, porque ya no trabaja ahí",
   "Puede haber responsabilidad contractual, y en su caso, responsabilidad por revelación de secretos y por violación a la LFPPI",
   "Solo una amonestación verbal",
   "Solo pierde su finiquito"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 25,
  "category": "Propiedad intelectual",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué protege una patente y no un derecho de autor?",
  "options": [
   "Una canción",
   "Una invención nueva con aplicación industrial",
   "Un libro",
   "Una fotografía"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 26,
  "category": "Propiedad intelectual",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es el INDAUTOR?",
  "options": [
   "El instituto que protege marcas",
   "El Instituto Nacional del Derecho de Autor",
   "El instituto de datos personales",
   "El instituto de comercio exterior"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 27,
  "category": "Contratos",
  "difficulty": "Fácil",
  "points": 5,
  "text": "Según el Código Civil Federal, ¿qué es un contrato?",
  "options": [
   "Una promesa sin efectos",
   "El acuerdo de voluntades para crear o transmitir derechos y obligaciones",
   "Solo un documento firmado ante notario",
   "Una factura"
  ],
  "correct": 1,
  "explanation": "Art. 1792 CCF."
 },
 {
  "id": 28,
  "category": "Contratos",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Cuáles son los elementos esenciales de un contrato?",
  "options": [
   "Fecha, lugar y firma",
   "Consentimiento, objeto lícito y causa lícita",
   "Precio, plazo y testigos",
   "Nombre, RFC y domicilio"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 29,
  "category": "Contratos",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué pasa si no hay consentimiento en un contrato?",
  "options": [
   "Se puede corregir con una factura",
   "El contrato no es válido",
   "Se vuelve un contrato verbal válido siempre",
   "No pasa nada"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 30,
  "category": "Contratos",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un NDA?",
  "options": [
   "Un contrato de compraventa",
   "Un acuerdo de confidencialidad para no revelar información",
   "Un contrato laboral",
   "Un aviso de privacidad"
  ],
  "correct": 1,
  "explanation": "Non-Disclosure Agreement."
 },
 {
  "id": 31,
  "category": "Contratos",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un SLA en un contrato de tecnología?",
  "options": [
   "Un seguro de vida",
   "Un acuerdo de nivel de servicio, por ejemplo disponibilidad del 99.9%",
   "Una licencia de software",
   "Un contrato de arrendamiento"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 32,
  "category": "Contratos",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Para qué sirve una cláusula de limitación de responsabilidad?",
  "options": [
   "Para no pagar nunca",
   "Para poner un tope a lo que una parte debe pagar si incumple, por ejemplo hasta lo pagado en 12 meses",
   "Para cancelar el contrato sin aviso",
   "Para subir el precio"
  ],
  "correct": 1,
  "explanation": "Sin ella, el riesgo puede ser ilimitado."
 },
 {
  "id": 33,
  "category": "Contratos",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es una cláusula penal?",
  "options": [
   "Una sanción del Código Penal",
   "Una pena convencional que se paga si se incumple el contrato",
   "Una cláusula ilegal",
   "Una multa del SAT"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 34,
  "category": "Contratos",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es la vigencia de un contrato?",
  "options": [
   "El precio",
   "El periodo en el que el contrato produce efectos",
   "El lugar de firma",
   "El número de copias"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 35,
  "category": "Contratos",
  "difficulty": "Difícil",
  "points": 15,
  "text": "Si un contrato de licencia de software no dice nada sobre sublicencias, ¿se pueden otorgar?",
  "options": [
   "Sí, siempre",
   "No, en principio no se pueden otorgar si no están autorizadas expresamente",
   "Solo si es software libre",
   "Solo con permiso del SAT"
  ],
  "correct": 1,
  "explanation": "Hay que revisar la licencia y la LFPPI / LFDA."
 },
 {
  "id": 36,
  "category": "Contratos",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es un anexo en un contrato?",
  "options": [
   "Un documento que se borra",
   "Un documento que forma parte del contrato y lo complementa",
   "Una copia sin valor",
   "Un correo informal"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 37,
  "category": "Datos personales",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué ley regula los datos personales en empresas privadas en México?",
  "options": [
   "Ley Federal del Trabajo",
   "Ley Federal de Protección de Datos Personales en Posesión de los Particulares",
   "Ley General de Sociedades Mercantiles",
   "Código Penal Federal"
  ],
  "correct": 1,
  "explanation": "LFPDPPP."
 },
 {
  "id": 38,
  "category": "Datos personales",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué debe contener el aviso de privacidad?",
  "options": [
   "Solo el nombre de la empresa",
   "Quién es el responsable, para qué se usarán los datos y cómo ejercer los derechos ARCO",
   "Solo el RFC",
   "Solo la dirección"
  ],
  "correct": 1,
  "explanation": "Arts. 15 y 16 LFPDPPP."
 },
 {
  "id": 39,
  "category": "Datos personales",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un dato sensible?",
  "options": [
   "Cualquier dato",
   "El que revela salud, religión, orientación sexual, origen étnico o datos biométricos, y exige mayor protección",
   "Solo el nombre",
   "Solo el correo"
  ],
  "correct": 1,
  "explanation": "Art. 3, fracc. VI LFPDPPP."
 },
 {
  "id": 40,
  "category": "Datos personales",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Se necesita consentimiento expreso para tratar datos sensibles?",
  "options": [
   "No, nunca",
   "Sí, por regla general, debe ser expreso y por escrito",
   "Solo si el titular lo pide",
   "Solo para empresas grandes"
  ],
  "correct": 1,
  "explanation": "Art. 9 LFPDPPP."
 },
 {
  "id": 41,
  "category": "Datos personales",
  "difficulty": "Media",
  "points": 10,
  "text": "Si un cliente pide que borren sus datos, ¿qué derecho está ejerciendo?",
  "options": [
   "Acceso",
   "Rectificación",
   "Cancelación",
   "Oposición"
  ],
  "correct": 2,
  "explanation": "Es uno de los derechos ARCO."
 },
 {
  "id": 42,
  "category": "Datos personales",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es una transferencia de datos personales?",
  "options": [
   "Copiar datos dentro de la misma empresa",
   "Comunicar datos a un tercero distinto del responsable, que requiere consentimiento salvo excepciones de ley",
   "Guardar datos en la nube propia",
   "Imprimir datos"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 43,
  "category": "Datos personales",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué debe hacer una empresa si hay una vulneración de datos?",
  "options": [
   "Ocultarla",
   "Notificar a los titulares afectados y, en su caso, a la autoridad, y tomar medidas correctivas",
   "Solo cambiar contraseñas",
   "Esperar a que alguien se queje"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 44,
  "category": "Datos personales",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es el encargado en la LFPDPPP?",
  "options": [
   "El titular de los datos",
   "La persona que trata datos por cuenta del responsable, por ejemplo un proveedor de nube",
   "El abogado de la empresa",
   "El cliente"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 45,
  "category": "Datos personales",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es un dato personal?",
  "options": [
   "Solo el CURP",
   "Cualquier información que identifica o hace identificable a una persona",
   "Solo el nombre completo",
   "Solo la huella digital"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 46,
  "category": "Ciberseguridad",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué hace un firewall?",
  "options": [
   "Crea contraseñas",
   "Filtra el tráfico de red y bloquea accesos no autorizados",
   "Hace respaldos",
   "Encripta correos, únicamente"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 47,
  "category": "Ciberseguridad",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué hace un agente DLP?",
  "options": [
   "Detecta y bloquea la salida de información sensible",
   "Acelera internet",
   "Instala software",
   "Borra virus, únicamente"
  ],
  "correct": 0,
  "explanation": "Data Loss Prevention."
 },
 {
  "id": 48,
  "category": "Ciberseguridad",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un EDR?",
  "options": [
   "Un antivirus tradicional",
   "Una plataforma que detecta y responde a amenazas en computadoras y servidores",
   "Un firewall",
   "Una VPN"
  ],
  "correct": 1,
  "explanation": "Endpoint Detection and Response."
 },
 {
  "id": 49,
  "category": "Ciberseguridad",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Para qué sirve CrowdStrike Falcon?",
  "options": [
   "Es un firewall de red",
   "Es una plataforma EDR",
   "Es un software de contabilidad",
   "Es una base de datos"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 50,
  "category": "Ciberseguridad",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué empresa es famosa por su firewall FortiGate?",
  "options": [
   "Microsoft",
   "Fortinet",
   "Apple",
   "Oracle"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 51,
  "category": "Ciberseguridad",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué empresa es famosa por sus firewalls de nueva generación y por Prisma?",
  "options": [
   "Palo Alto Networks",
   "Adobe",
   "SAP",
   "Zoom"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 52,
  "category": "Ciberseguridad",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué hace un SIEM?",
  "options": [
   "Solo guarda logs",
   "Recolecta, correlaciona y alerta sobre eventos de seguridad en tiempo real",
   "Es un antivirus",
   "Es una VPN"
  ],
  "correct": 1,
  "explanation": "Security Information and Event Management."
 },
 {
  "id": 53,
  "category": "Ciberseguridad",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es la autenticación multifactor (MFA)?",
  "options": [
   "Usar la misma contraseña en todos lados",
   "Verificar la identidad con dos o más factores, por ejemplo contraseña + código en el celular",
   "Cambiar la contraseña cada año",
   "Usar solo biometría"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 54,
  "category": "Ciberseguridad",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es una VPN?",
  "options": [
   "Una red privada virtual que cifra la conexión",
   "Un virus",
   "Un tipo de firewall físico",
   "Un correo seguro"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 55,
  "category": "Ciberseguridad",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es el cifrado?",
  "options": [
   "Borrar datos",
   "Transformar información para que solo quien tiene la clave pueda leerla",
   "Comprimir archivos",
   "Hacer respaldos"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 56,
  "category": "Ingeniería social",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es el phishing?",
  "options": [
   "Una técnica de pesca",
   "Un correo o mensaje que suplanta a una empresa para robar credenciales o datos",
   "Un virus",
   "Un firewall"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 57,
  "category": "Ingeniería social",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es el vishing?",
  "options": [
   "Phishing por SMS",
   "Estafa por llamada de voz, donde el atacante se hace pasar por banco o soporte",
   "Phishing por redes sociales",
   "Un tipo de malware"
  ],
  "correct": 1,
  "explanation": "Voice phishing."
 },
 {
  "id": 58,
  "category": "Ingeniería social",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es el smishing?",
  "options": [
   "Phishing por SMS",
   "Phishing por voz",
   "Phishing por correo",
   "Un ataque a servidores"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 59,
  "category": "Ingeniería social",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es el pretexting?",
  "options": [
   "Inventar un pretexto creíble para que la víctima entregue información",
   "Hackear un servidor",
   "Enviar spam",
   "Robar un celular"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 60,
  "category": "Ingeniería social",
  "difficulty": "Media",
  "points": 10,
  "text": "Si recibes un correo urgente de “tu banco” pidiendo que entres a un enlace para “verificar tu cuenta”, ¿qué debes hacer?",
  "options": [
   "Entrar de inmediato",
   "No dar clic, verificar por el canal oficial del banco y reportarlo",
   "Reenviarlo a todos",
   "Descargar el archivo adjunto"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 61,
  "category": "Ingeniería social",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es el BEC, Business Email Compromise?",
  "options": [
   "Un correo de marketing",
   "Suplantar el correo de un directivo o proveedor para pedir pagos o datos",
   "Un error de correo",
   "Un filtro antispam"
  ],
  "correct": 1,
  "explanation": "Es una de las estafas más costosas para empresas."
 },
 {
  "id": 62,
  "category": "Ingeniería social",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Por qué la ingeniería social funciona aunque haya tecnología?",
  "options": [
   "Porque ataca a las personas, no solo a los sistemas, usando urgencia, autoridad y confianza",
   "Porque no hay firewalls",
   "Porque los sistemas son malos",
   "Porque no hay contraseñas"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 63,
  "category": "Ingeniería social",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es el baiting?",
  "options": [
   "Dejar un USB infectado o un enlace atractivo para que la víctima lo abra",
   "Un tipo de firewall",
   "Un antivirus",
   "Una contraseña segura"
  ],
  "correct": 0,
  "explanation": ""
 },
 {
  "id": 64,
  "category": "Normas ISO",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué regula la ISO 27001?",
  "options": [
   "Calidad",
   "Seguridad de la información, un Sistema de Gestión de Seguridad de la Información",
   "Medio ambiente",
   "Continuidad del negocio, únicamente"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 65,
  "category": "Normas ISO",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué regula la ISO 22301?",
  "options": [
   "Seguridad de la información",
   "Continuidad del negocio ante incidentes o desastres",
   "Privacidad",
   "Calidad"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 66,
  "category": "Normas ISO",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es la ISO 27002?",
  "options": [
   "Una certificación obligatoria",
   "Un código de buenas prácticas con controles de seguridad de la información",
   "Una ley mexicana",
   "Un estándar de calidad"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 67,
  "category": "Normas ISO",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué regula la ISO 27701?",
  "options": [
   "Calidad",
   "Es una extensión de privacidad de la ISO 27001, para la gestión de información personal",
   "Medio ambiente",
   "Seguridad física, únicamente"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 68,
  "category": "Normas ISO",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es el NIST CSF?",
  "options": [
   "Una ley mexicana",
   "Un marco de ciberseguridad de EE. UU. con funciones: identificar, proteger, detectar, responder y recuperar",
   "Un antivirus",
   "Una ISO"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 69,
  "category": "Normas ISO",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Cuál es la diferencia entre ISO 27001 y 27002?",
  "options": [
   "Son lo mismo",
   "27001 establece los requisitos para certificar un SGSI, 27002 da la guía de controles",
   "27002 es obligatoria y 27001 no",
   "27001 es de calidad"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 70,
  "category": "Normas ISO",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es un SGSI?",
  "options": [
   "Un software",
   "Un Sistema de Gestión de Seguridad de la Información, con políticas, riesgos y mejora continua",
   "Un firewall",
   "Un contrato"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 71,
  "category": "Normas ISO",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué regula la ISO 9001?",
  "options": [
   "Seguridad de la información",
   "Gestión de la calidad",
   "Privacidad",
   "Continuidad del negocio"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 72,
  "category": "Inteligencia artificial",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es un prompt?",
  "options": [
   "Un virus",
   "La instrucción que le das a una IA para que genere una respuesta",
   "Un modelo de IA",
   "Un dato personal"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 73,
  "category": "Inteligencia artificial",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es un LLM?",
  "options": [
   "Un tipo de firewall",
   "Un modelo grande de lenguaje, entrenado con grandes volúmenes de texto",
   "Una ley",
   "Un contrato"
  ],
  "correct": 1,
  "explanation": "Large Language Model."
 },
 {
  "id": 74,
  "category": "Inteligencia artificial",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué debe tener un buen prompt?",
  "options": [
   "Solo la pregunta",
   "Rol, contexto, tarea clara, formato deseado y ejemplos",
   "Solo emojis",
   "Solo la palabra clave"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 75,
  "category": "Inteligencia artificial",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es una alucinación en IA?",
  "options": [
   "Un error de internet",
   "Cuando la IA genera información que parece real pero es falsa o inventada",
   "Un virus",
   "Un sesgo legal"
  ],
  "correct": 1,
  "explanation": "Por eso hay que verificar."
 },
 {
  "id": 76,
  "category": "Inteligencia artificial",
  "difficulty": "Media",
  "points": 10,
  "text": "¿México tiene una ley federal específica de IA?",
  "options": [
   "Sí, desde 2020",
   "No, a la fecha no hay una ley federal específica; se aplican la LFPDPPP, la LFDA, la LFPPI y otras leyes según el caso",
   "Sí, la ISO 27001 es la ley de IA",
   "No, y no aplica ninguna ley"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 77,
  "category": "Inteligencia artificial",
  "difficulty": "Difícil",
  "points": 15,
  "text": "Si usas IA con datos personales de clientes, ¿qué debes cuidar?",
  "options": [
   "Nada",
   "Tener base legal, aviso de privacidad, minimización de datos y no subir datos sensibles sin consentimiento",
   "Solo borrar el historial",
   "Solo usar IA gratuita"
  ],
  "correct": 1,
  "explanation": "LFPDPPP."
 },
 {
  "id": 78,
  "category": "Inteligencia artificial",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es el sesgo en IA?",
  "options": [
   "Un error de programación sin impacto",
   "Cuando el modelo reproduce prejuicios de los datos con los que fue entrenado y puede discriminar",
   "Una alucinación",
   "Un prompt malo"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 79,
  "category": "Inteligencia artificial",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es un token en un LLM?",
  "options": [
   "Una moneda",
   "La unidad mínima de texto que procesa el modelo, puede ser una palabra o parte de ella",
   "Una contraseña",
   "Un archivo"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 80,
  "category": "Inteligencia artificial",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué es la IA generativa?",
  "options": [
   "IA que solo clasifica datos",
   "IA que crea contenido nuevo: texto, imágenes, código, etc.",
   "IA que solo juega ajedrez",
   "Un robot físico"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 81,
  "category": "Derecho penal",
  "difficulty": "Fácil",
  "points": 5,
  "text": "¿Qué sanciona el art. 211 Bis 1 del Código Penal Federal?",
  "options": [
   "El robo de un celular",
   "El acceso ilícito a sistemas y equipos de informática, modificar, destruir o provocar pérdida de información protegida",
   "El fraude fiscal",
   "La difamación"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 82,
  "category": "Derecho penal",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué sanciona el art. 211 Bis 2 del Código Penal Federal?",
  "options": [
   "Conocer o copiar información de sistemas informáticos sin autorización, aunque no se modifique",
   "Solo borrar información",
   "Solo cambiar contraseñas propias",
   "Usar internet sin permiso de tus papás"
  ],
  "correct": 0,
  "explanation": "Es el caso típico de robo de información."
 },
 {
  "id": 83,
  "category": "Derecho penal",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Cuándo se agrava la pena por acceso ilícito?",
  "options": [
   "Nunca",
   "Si el sistema es de seguridad pública, de una institución financiera, o si quien lo hace es quien lo administra",
   "Solo si es de noche",
   "Solo si se usa una laptop"
  ],
  "correct": 1,
  "explanation": "Arts. 211 Bis 1 a 211 Bis 7 CPF."
 },
 {
  "id": 84,
  "category": "Derecho penal",
  "difficulty": "Difícil",
  "points": 15,
  "text": "En México, ¿hay un tipo penal federal llamado literalmente “robo de información”?",
  "options": [
   "Sí, es el art. 211 Bis 1",
   "No, como tal no hay un tipo autónomo con ese nombre; se persigue como acceso ilícito, revelación de secretos o fraude, según lo que se hizo",
   "Sí, en el Código Civil",
   "No, y no se sanciona"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 85,
  "category": "Derecho penal",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué es la revelación de secretos, art. 210 CPF?",
  "options": [
   "Contar un chisme",
   "Revelar información confidencial que conociste por tu trabajo o profesión",
   "Publicar una noticia",
   "Hablar en público"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 86,
  "category": "Derecho penal",
  "difficulty": "Difícil",
  "points": 15,
  "text": "Un exempleado copia la base de clientes de Totalsec y la vende a la competencia. ¿Qué puede haber?",
  "options": [
   "Nada, ya no trabaja ahí",
   "Responsabilidad penal por acceso ilícito y/o revelación de secretos, además de responsabilidad civil y contractual por violar el NDA",
   "Solo una falta administrativa",
   "Solo pierde su referencia laboral"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 87,
  "category": "Derecho penal",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué diferencia hay entre acceso ilícito y hacking ético?",
  "options": [
   "No hay diferencia",
   "El hacking ético es autorizado, con alcance y permiso por escrito; el acceso ilícito es sin autorización",
   "El ético no usa computadoras",
   "El ilícito es legal si no hay daño"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 88,
  "category": "Derecho penal",
  "difficulty": "Difícil",
  "points": 15,
  "text": "¿Qué es el fraude informático?",
  "options": [
   "Usar una computadora",
   "Engañar o manipular un sistema informático para obtener un beneficio ilícito",
   "Enviar un correo",
   "Olvidar una contraseña"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 89,
  "category": "Derecho penal",
  "difficulty": "Fácil",
  "points": 5,
  "text": "Si alguien entra a tu correo sin tu permiso y lee tus mensajes, ¿qué delito podría ser?",
  "options": [
   "Ninguno",
   "Acceso ilícito a sistemas, en su caso",
   "Solo una falta de educación",
   "Robo de celular"
  ],
  "correct": 1,
  "explanation": ""
 },
 {
  "id": 90,
  "category": "Derecho penal",
  "difficulty": "Media",
  "points": 10,
  "text": "¿Qué debe hacer una empresa si detecta acceso ilícito a sus sistemas?",
  "options": [
   "Ocultarlo",
   "Preservar evidencia, contener el incidente, notificar a los afectados si hay datos personales y denunciar ante la autoridad",
   "Borrar todo",
   "Esperar"
  ],
  "correct": 1,
  "explanation": ""
 }
];

export const CATEGORIES: string[] = ["Derecho básico", "Derecho corporativo", "Propiedad intelectual", "Contratos", "Datos personales", "Ciberseguridad", "Ingeniería social", "Normas ISO", "Inteligencia artificial", "Derecho penal", "Totalsec"];
