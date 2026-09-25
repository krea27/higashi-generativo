# Kazuhiro Higashi – Estudio de Composición Interactiva

https://krea27.github.io/higashi-generativo/

Obra generativa e interactiva controlada por voz y sonido, inspirada en el lenguaje visual del artista japonés **Kazuhiro Higashi**. Desarrollada en el marco de la cátedra **Informática Aplicada 2** (Aranda - Longo).

---

## 🎨 Descripción de la Obra

El proyecto explora la traducción del gesto vocal en pintura digital generativa. A través de la detección en tiempo real de tono (frecuencia fundamental) y volumen (amplitud), el usuario compone piezas gráficas abstractas compuestas por siluetas vectoriales (SVG) y paletas de color características del artista.

La composición evoluciona progresivamente hasta alcanzar un límite de equilibrio compositivo (30 formas), momento en el cual la obra pasa a un estado de contemplación y exporta automáticamente la pieza final en formato PNG.

---

## 🕹️ Dinámica e Interacciones

El sistema cuenta con una máquina de estados finita que guía al participante en las distintas etapas:

1. **Estado de Inicio (Habilitación de Audio):**
   * Haz **clic** en cualquier parte de la pantalla para otorgar permisos de micrófono al navegador e inicializar el contexto de audio.

2. **Modo Selección de Paleta:**
   * **Cantar o modular con la voz:** Navega de manera cíclica por las 4 paletas cromáticas disponibles.
   * **2 aplausos rápidos (golpes de volumen):** Confirma la paleta seleccionada e ingresa al lienzo interactivo.

3. **Modo Interactivo (Composición en Lienzo):**
   * **Cantar / Emitir sonidos continuos:** Dibuja formas vectoriales sobre el lienzo según el registro vocal detectado:
     * **Graves (< 180 Hz):** Formas de mayor peso y densidad visual.
     * **Medios (180 Hz – 350 Hz):** Formas lineales y estilizadas de transición.
     * **Agudos (> 350 Hz):** Formas livianas y dinámicas.
   * Las figuras se distribuyen con una grilla aleatoria con micro-desplazamientos (*jitter*) y rotaciones angulares sutiles, revelándose con fundido de opacidad (*fade-in*).
   * **2 aplausos rápidos:** Reinicia la obra y regresa al menú de selección de paleta.

4. **Modo Contemplación y Guardado:**
   * Al alcanzar **30 figuras en lienzo**, la interacción sonora se congela.
   * Se inicia una cuenta regresiva de 3 segundos para observar la composición final.
   * La obra se descarga automáticamente en alta calidad con el nombre `Estudio_Higashi_AAAAMMDD_HHMMSS.png`.

---

## 🛠️ Tecnologías y Librerías

* **[p5.js](https://p5js.org/):** Renderizado gráfico en Canvas 2D y gestión del bucle principal (`setup`, `draw`).
* **p5.sound:** Captura de señal de entrada del micrófono (`p5.AudioIn`) y medición de amplitud.
* **[ml5.js](https://ml5js.org/):** Detección de frecuencia (Pitch Detection) utilizando el modelo de Deep Learning **CREPE** preentrenado.
* **SVG:** Gráficos vectoriales optimizados coloreados dinámicamente mediante tintes alpha.

---

## 🚀 Cómo Ejecutar el Proyecto Localmente

> [!IMPORTANT]
> **No abras el archivo `index.html` con doble clic directo (`file:///`):** Los navegadores modernos bloquean el acceso al micrófono y la carga de archivos locales (`.svg`) por políticas de seguridad (CORS y Secure Context). Se debe ejecutar mediante un servidor web local o HTTPS.

### Opción 1: Visual Studio Code (Recomendada)
1. Abre la carpeta del proyecto en **VS Code**.
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

### Opción 2: Servidor local por Terminal (Python / Node)
Con Python instalado, abre una terminal en la carpeta del proyecto y ejecuta:
```bash
# Python 3
python -m http.server 8000
```
Luego abre tu navegador en `http://localhost:8000`.

---

## 🌐 Publicación en GitHub Pages

Para compartir la obra y que funcione online sin instalar nada:
1. Sube este repositorio a tu cuenta de GitHub asegurándote de que `index.html` esté en la **raíz**.
2. En GitHub, ve a **Settings** > **Pages** (en el menú lateral izquierdo).
3. En **Build and deployment** > **Branch**, selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
4. Haz clic en **Save**. En un par de minutos tendrás tu enlace público con `https://`, listo para interactuar con micrófono.
