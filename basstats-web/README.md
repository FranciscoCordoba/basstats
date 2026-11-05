# BasStats Web Client 🏀

Aplicación Frontend en **React + TypeScript + Vite + Tailwind CSS** para el seguimiento y analítica de estadísticas de básquetbol en vivo, basada en los wireframes de Stitch.

---

## 📱 Pantallas Implementadas

1. **Menú Principal (`/`)**: Acceso rápido a cargar nuevo partido, alerta de partido en vivo, último resultado y líderes anotadores.
2. **Consola de Estadísticas En Vivo (`/match/live`)**: Marcador en tiempo real, selector de cuartos (Q1-Q4), timer, los 5 jugadores activos en cancha, **Cancha interactiva con registro de coordenadas de tiros (x, y)**, botonera de acciones rápidas (tiros anotados/fallados, rebotes, asistencias, robos, faltas, tapones), feed de eventos y botón deshacer.
3. **Login / Registro (`/login`)**: Autenticación y registro de equipo (nombre, nick, correo, contraseña, logo).
4. **Panel de Equipo (`/team`)**: Perfil del club, métricas colectivas (PPG, RPG, APG, FG%), lista de plantilla, historial de partidos y modal para agregar nuevos jugadores.
5. **Perfil de Jugador Detallado (`/player/:id`)**: Estadísticas por partido (PPG, RPG, APG, SPG, BPG, FG%), mapa de tiros de temporada (**Shot Chart**) y desglose de encuentros.
6. **Selección de Roster (`/roster`)**: Configuración previa al encuentro (Rival, PIN) y selección del quinteto titular (5 jugadores).

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias (si no se han instalado)
npm install

# Iniciar servidor de desarrollo en Vite (http://localhost:5173)
npm run dev

# Compilar para producción
npm run build
```

---

## 🔗 Integración con API

El cliente se conecta por defecto a `http://localhost:3000/api` (configurable vía variable `VITE_API_URL`) y cuenta con fallback automático en modo offline para desarrollo sin interrupciones.
