import RoutineExercise from "../models/routineExercise.js";

const defaultExercises = [
  ["Flexiones controladas", "Todos", "Pecho", "Inicial", "Fuerza", 3, "10-12", "60 segundos", "Manten el abdomen firme y baja el pecho con control.", "https://www.youtube.com/embed/IODxDxX7oi4", 1],
  ["Press de pecho con mancuernas", "Hombre", "Pecho", "Intermedio", "Fuerza", 4, "8-10", "90 segundos", "Controla la bajada y empuja sin despegar la espalda.", "https://www.youtube.com/embed/VmB1G1K7v94", 2],
  ["Press inclinado con mancuernas", "Mujer", "Pecho", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Manten hombros estables y sube con recorrido controlado.", "https://www.youtube.com/embed/8iPEnn-ltC8", 3],
  ["Remo con mancuerna", "Todos", "Espalda", "Inicial", "Fuerza", 3, "12 por lado", "60 segundos", "Lleva el codo hacia la cadera sin girar el torso.", "https://www.youtube.com/embed/pYcpY20QaE8", 4],
  ["Jalon al pecho", "Todos", "Espalda", "Intermedio", "Fuerza", 4, "10-12", "75 segundos", "Lleva la barra al pecho sin encoger hombros.", "https://www.youtube.com/embed/CAwf7n6Luuc", 5],
  ["Remo sentado", "Mujer", "Espalda", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Aprieta escapulas y evita llevar el cuello hacia adelante.", "https://www.youtube.com/embed/GZbfZ033f74", 6],
  ["Curl de biceps", "Todos", "Brazo", "Inicial", "Fuerza", 3, "12-15", "45 segundos", "Sube sin balancear el cuerpo y baja lento.", "https://www.youtube.com/embed/ykJmrZ5v0Oo", 7],
  ["Extension de triceps en polea", "Hombre", "Brazo", "Intermedio", "Fuerza", 4, "10-12", "60 segundos", "Manten codos fijos y extiende completo sin balancearte.", "https://www.youtube.com/embed/2-LAMcpzODU", 8],
  ["Curl martillo", "Mujer", "Brazo", "Inicial", "Tonificar", 3, "12-15", "45 segundos", "Agarre neutro, hombros quietos y bajada controlada.", "https://www.youtube.com/embed/zC3nLlEvin4", 9],
  ["Sentadilla goblet", "Todos", "Pierna", "Inicial", "Fuerza", 4, "10-12", "75 segundos", "Rodillas alineadas, pecho arriba y talones firmes.", "https://www.youtube.com/embed/MeIiIdhvXT4", 10],
  ["Prensa de piernas", "Hombre", "Pierna", "Intermedio", "Fuerza", 4, "10-12", "90 segundos", "Baja con control y no bloquees completamente las rodillas.", "https://www.youtube.com/embed/IZxyjW7MPJQ", 11],
  ["Zancadas alternas", "Mujer", "Pierna", "Inicial", "Tonificar", 3, "12 por pierna", "60 segundos", "Paso largo, torso firme y rodilla alineada con el pie.", "https://www.youtube.com/embed/QOVaHwm-Q6U", 12],
  ["Hip thrust", "Mujer", "Gluteo", "Inicial", "Tonificar", 4, "12-15", "75 segundos", "Empuja desde los talones y contrae gluteos arriba.", "https://www.youtube.com/embed/LM8XHLYJoYs", 13],
  ["Puente de gluteo", "Todos", "Gluteo", "Inicial", "Tonificar", 3, "15-20", "45 segundos", "Sube la cadera sin arquear la espalda baja.", "https://www.youtube.com/embed/wPM8icPu6H8", 14],
  ["Patada de gluteo en polea", "Mujer", "Gluteo", "Intermedio", "Tonificar", 4, "12-15", "60 segundos", "Mueve la pierna desde la cadera y controla el regreso.", "https://www.youtube.com/embed/SJ1Xuz9D-ZQ", 15],
  ["Plancha frontal", "Todos", "Abdomen", "Inicial", "Resistencia", 3, "30-45 segundos", "45 segundos", "Cadera estable, cuello neutro y respiracion constante.", "https://www.youtube.com/embed/pSHjTRCQxIw", 16],
  ["Crunch controlado", "Todos", "Abdomen", "Inicial", "Tonificar", 3, "15-20", "45 segundos", "Sube solo el torso alto y evita tirar del cuello.", "https://www.youtube.com/embed/Xyd_fa5zoEU", 17],
  ["Elevacion de piernas", "Hombre", "Abdomen", "Intermedio", "Fuerza", 4, "10-12", "60 segundos", "Controla la bajada y manten la zona lumbar estable.", "https://www.youtube.com/embed/JB2oyawG9KI", 18],
  ["Press militar", "Hombre", "Hombro", "Intermedio", "Fuerza", 4, "8-10", "90 segundos", "Aprieta abdomen y empuja en linea vertical.", "https://www.youtube.com/embed/qEwKCR5JCog", 19],
  ["Peso muerto rumano", "Todos", "Pierna", "Intermedio", "Fuerza", 4, "10", "90 segundos", "Cadera atras, espalda neutra y barra cerca del cuerpo.", "https://www.youtube.com/embed/2SHsk9AzdjA", 20],
  ["Mountain climbers", "Todos", "Full body", "Inicial", "Bajar grasa", 4, "30 segundos", "45 segundos", "Alterna rodillas rapido sin levantar la cadera.", "https://www.youtube.com/embed/nmwgirgXLYM", 21],
  ["Burpees modificados", "Todos", "Full body", "Intermedio", "Bajar grasa", 4, "30 segundos", "60 segundos", "Aterriza suave y conserva ritmo constante.", "https://www.youtube.com/embed/TU8QYVW0gDU", 22],
  ["Aperturas con mancuernas", "Todos", "Pecho", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Abre con control y junta las mancuernas sin chocar arriba.", "https://www.youtube.com/embed/eozdVDA78K0", 23],
  ["Press de banca", "Hombre", "Pecho", "Avanzado", "Fuerza", 4, "6-8", "120 segundos", "Pies firmes, escapulas atras y barra al centro del pecho.", "https://www.youtube.com/embed/rT7DgCr-3pg", 24],
  ["Press cerrado", "Mujer", "Pecho", "Intermedio", "Tonificar", 3, "10-12", "75 segundos", "Manten codos cerca del cuerpo y empuja con control.", "https://www.youtube.com/embed/vthMCtgVtFw", 25],
  ["Remo con barra", "Hombre", "Espalda", "Intermedio", "Fuerza", 4, "8-10", "90 segundos", "Inclina el torso, espalda neutra y lleva la barra al abdomen.", "https://www.youtube.com/embed/9efgcAjQe7E", 26],
  ["Pull over con mancuerna", "Todos", "Espalda", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Manten costillas abajo y mueve la mancuerna en arco controlado.", "https://www.youtube.com/embed/tpLnfSQJ0gg", 27],
  ["Remo en polea baja", "Mujer", "Espalda", "Intermedio", "Tonificar", 4, "10-12", "75 segundos", "Tira hacia el abdomen y aprieta la espalda al final.", "https://www.youtube.com/embed/HJSVR_67OlM", 28],
  ["Curl predicador", "Hombre", "Brazo", "Intermedio", "Fuerza", 4, "8-10", "75 segundos", "Apoya bien el brazo y evita levantar el hombro.", "https://www.youtube.com/embed/fIWP-FRFNU0", 29],
  ["Fondos en banco", "Todos", "Brazo", "Inicial", "Tonificar", 3, "10-12", "60 segundos", "Baja cerca del banco y empuja con triceps, no con cuello.", "https://www.youtube.com/embed/0326dy_-CzM", 30],
  ["Elevacion lateral", "Mujer", "Brazo", "Inicial", "Tonificar", 3, "12-15", "45 segundos", "Sube hasta linea de hombros y baja lento.", "https://www.youtube.com/embed/3VcKaXpzqRo", 31],
  ["Sentadilla con barra", "Hombre", "Pierna", "Avanzado", "Fuerza", 4, "6-8", "120 segundos", "Manten abdomen firme, baja controlado y empuja desde talones.", "https://www.youtube.com/embed/SW_C1A-rejs", 32],
  ["Extension de cuadriceps", "Todos", "Pierna", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Extiende sin golpear la maquina y controla la bajada.", "https://www.youtube.com/embed/YyvSfVjQeL0", 33],
  ["Curl femoral", "Mujer", "Pierna", "Intermedio", "Tonificar", 4, "10-12", "60 segundos", "Flexiona rodillas sin levantar la cadera del apoyo.", "https://www.youtube.com/embed/1Tq3QdYUuHs", 34],
  ["Abduccion de cadera", "Mujer", "Gluteo", "Inicial", "Tonificar", 3, "15-20", "45 segundos", "Abre las piernas con control y evita impulsarte.", "https://www.youtube.com/embed/G_8LItOiZ0Q", 35],
  ["Peso muerto sumo", "Hombre", "Gluteo", "Intermedio", "Fuerza", 4, "8-10", "90 segundos", "Pies abiertos, espalda firme y empuje fuerte de cadera.", "https://www.youtube.com/embed/9ZuXKqRbT9k", 36],
  ["Step up al banco", "Todos", "Gluteo", "Inicial", "Tonificar", 3, "12 por pierna", "60 segundos", "Sube empujando con la pierna de apoyo y controla la bajada.", "https://www.youtube.com/embed/dQqApCGd5Ss", 37],
  ["Dead bug", "Todos", "Abdomen", "Inicial", "Resistencia", 3, "10 por lado", "45 segundos", "Manten la espalda baja pegada al suelo y alterna lento.", "https://www.youtube.com/embed/4XLEnwUr1d8", 38],
  ["Russian twist", "Mujer", "Abdomen", "Intermedio", "Tonificar", 3, "20 giros", "45 segundos", "Gira el torso con abdomen activo y pecho arriba.", "https://www.youtube.com/embed/wkD8rjkodUI", 39],
  ["Plancha lateral", "Hombre", "Abdomen", "Intermedio", "Resistencia", 3, "30 segundos por lado", "45 segundos", "Alinea hombro, cadera y tobillo sin dejar caer la pelvis.", "https://www.youtube.com/embed/K2VljzCC16g", 40],
  ["Press Arnold", "Todos", "Hombro", "Intermedio", "Fuerza", 4, "10-12", "75 segundos", "Rota las mancuernas con control y no arquees la espalda.", "https://www.youtube.com/embed/6Z15_WdXmVw", 41],
  ["Face pull", "Todos", "Hombro", "Inicial", "Tonificar", 3, "12-15", "60 segundos", "Tira hacia el rostro con codos altos y escapulas activas.", "https://www.youtube.com/embed/rep-qVOkqgk", 42],
  ["Elevacion frontal", "Mujer", "Hombro", "Inicial", "Tonificar", 3, "12-15", "45 segundos", "Sube al frente con brazos controlados y baja sin impulso.", "https://www.youtube.com/embed/-t7fuZ0KhDA", 43],
  ["Jumping jacks", "Todos", "Full body", "Inicial", "Bajar grasa", 4, "40 segundos", "30 segundos", "Manten ritmo constante y cae suave con rodillas flexionadas.", "https://www.youtube.com/embed/c4DAnQ6DtF8", 44],
  ["Kettlebell swing", "Hombre", "Full body", "Intermedio", "Fuerza", 4, "15", "60 segundos", "Impulsa con cadera, no con brazos, y conserva espalda neutra.", "https://www.youtube.com/embed/YSxHifyI6s8", 45],
  ["Sentadilla con salto", "Mujer", "Full body", "Intermedio", "Bajar grasa", 4, "12-15", "60 segundos", "Aterriza suave y vuelve a bajar con control.", "https://www.youtube.com/embed/aclHkVaku9U", 46],
  ["Caminata lateral con banda", "Mujer", "Gluteo", "Inicial", "Tonificar", 3, "15 pasos por lado", "45 segundos", "Manten tension en la banda y rodillas alineadas.", "https://www.youtube.com/embed/EmSflSUgXro", 47],
  ["Dominada asistida", "Hombre", "Espalda", "Avanzado", "Fuerza", 4, "6-8", "120 segundos", "Sube llevando el pecho hacia la barra y baja controlado.", "https://www.youtube.com/embed/eGo4IYlbE5g", 48],
  ["Press frances", "Todos", "Brazo", "Intermedio", "Fuerza", 4, "10-12", "75 segundos", "Manten codos fijos y extiende sin abrir los brazos.", "https://www.youtube.com/embed/d_KZxkY_0cM", 49],
  ["Farmer walk", "Todos", "Full body", "Avanzado", "Fuerza", 4, "30 metros", "90 segundos", "Camina erguido con abdomen firme y hombros abajo.", "https://www.youtube.com/embed/rt17lmnaLSM", 50],
];

export const ensureDefaultRoutineExercises = async () => {
  await Promise.all(
    defaultExercises.map(
      ([name, gender, focus, level, goal, sets, reps, rest, technique, videoUrl, order]) =>
        RoutineExercise.updateOne(
          { name, gender, focus },
          {
            $setOnInsert: {
              name,
              gender,
              focus,
              level,
              goal,
              sets,
              reps,
              rest,
              technique,
              videoUrl,
              order,
              isActive: true,
            },
          },
          { upsert: true },
        ),
    ),
  );
};

export const getRoutineExercises = async () => {
  await ensureDefaultRoutineExercises();
  return RoutineExercise.find().sort({ order: 1, createdAt: -1 });
};
