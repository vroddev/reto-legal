// Preguntas especiales de interrupción, acordadas con Víctor.
// Rescate: muy fáciles, basadas en hechos del propio banco de 90 preguntas.
// Bonus divertido: preguntas ligeras propuestas en la conversación de diseño.

export type BonusQuestion = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

export const RESCUE_QUESTIONS: BonusQuestion[] = [
  {
    text: "¿Qué significan las siglas NDA en un contrato?",
    options: [
      "Acuerdo de confidencialidad",
      "Norma de Auditoría",
      "Nuevo Documento Administrativo",
      "Notificación de Adeudo",
    ],
    correct: 0,
    explanation: "NDA = Non-Disclosure Agreement, acuerdo de confidencialidad.",
  },
  {
    text: "¿Qué hace un firewall?",
    options: [
      "Hace respaldos de información",
      "Filtra el tráfico de red y bloquea accesos no autorizados",
      "Crea contraseñas",
      "Encripta correos, únicamente",
    ],
    correct: 1,
    explanation: "El firewall controla qué tráfico entra y sale de la red.",
  },
  {
    text: "¿Qué institución registra las marcas y patentes en México?",
    options: ["SAT", "INDAUTOR", "IMPI", "INAI"],
    correct: 2,
    explanation: "El Instituto Mexicano de la Propiedad Industrial (IMPI).",
  },
  {
    text: "¿Qué es el phishing?",
    options: [
      "Un tipo de firewall",
      "Un virus de computadora",
      "Una técnica de pesca deportiva",
      "Un correo o mensaje que suplanta a una empresa para robar credenciales o datos",
    ],
    correct: 3,
    explanation: "Es ingeniería social: suplantar para que la víctima entregue sus datos.",
  },
  {
    text: "¿Cuánto dura el registro de una marca en México?",
    options: [
      "10 años, renovable",
      "5 años sin renovación",
      "20 años improrrogables",
      "Para siempre, sin trámites",
    ],
    correct: 0,
    explanation: "10 años renovables, según la Ley Federal de Protección a la Propiedad Industrial.",
  },
  {
    text: "¿Qué ley regula las sociedades mercantiles en México?",
    options: [
      "Ley Federal del Trabajo",
      "Ley General de Sociedades Mercantiles",
      "Código Civil Federal",
      "Ley del Seguro Social",
    ],
    correct: 1,
    explanation: "La LGSM regula la S.A., la S. de R.L., la SAS y demás sociedades.",
  },
];

export const FUN_QUESTIONS: BonusQuestion[] = [
  {
    text: "¿Cuál es la contraseña más usada y más insegura del mundo?",
    options: ["qwerty2024", "password", "123456", "admin123"],
    correct: 2,
    explanation: "«123456» encabeza año tras año las listas de contraseñas filtradas. ¡Nunca la uses!",
  },
  {
    text: "¿Qué empresa es famosa por su firewall FortiGate?",
    options: ["Microsoft", "Fortinet", "Apple", "Oracle"],
    correct: 1,
    explanation: "FortiGate es el firewall insignia de Fortinet.",
  },
  {
    text: "Un cliente te pide «borrar todo de internet para siempre». Como Legal, ¿qué le contestas?",
    options: [
      "Claro, hay un botón para eso",
      "Se paga una cuota y listo",
      "Lo borra el proveedor de internet",
      "No se puede garantizar: se puede solicitar la eliminación en ciertos casos, pero no existe un botón de borrar todo",
    ],
    correct: 3,
    explanation: "Se pueden ejercer derechos ARCO y pedir bajas caso por caso; «borrar todo internet» no existe.",
  },
  {
    text: "Te llega un correo: «¡GANASTE un premio! Da clic y escribe tu contraseña para reclamarlo». ¿Qué es?",
    options: [
      "Phishing",
      "Una promoción legítima",
      "Un SLA",
      "Un respaldo automático",
    ],
    correct: 0,
    explanation: "Urgencia + premio + pedir tu contraseña = phishing de manual.",
  },
  {
    text: "¿Qué significa que un correo tenga un candado y «cifrado»?",
    options: [
      "Que nadie, ni el destinatario, podrá leerlo jamás",
      "Que solo quien tiene la clave puede leer su contenido",
      "Que el correo es gratis",
      "Que el correo ya fue borrado",
    ],
    correct: 1,
    explanation: "El cifrado transforma la información para que solo la lea quien tiene la clave.",
  },
];
