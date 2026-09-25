// =====================================================================
// 1. VARIABLES GLOBALES Y ARCHIVOS
// Se definen los arrays que cargarán tus archivos SVG.
// ======================================================================

let archivosGraves = [
  'forma_2g.svg', 'forma_3g.svg', 'forma_4g.svg', 'forma_8g.svg', 
  'forma_11g.svg', 'forma_12g.svg', 'forma_29g.svg'
];

let archivosMedios = [
  'forma_1m.svg', 'forma_5m.svg', 'forma_6m.svg', 'forma_7m.svg', 
  'forma_9m.svg', 'forma_10m.svg', 'forma_13m.svg', 'forma_14m.svg', 
  'forma_16m.svg', 'forma_18m.svg'
];

let archivosAgudos = [
  'forma_15a.svg', 'forma_17a.svg', 'forma_19a.svg', 'forma_20a.svg', 
  'forma_21a.svg', 'forma_22a.svg', 'forma_23a.svg', 'forma_24a.svg', 
  'forma_25a.svg', 'forma_26a.svg', 'forma_27a.svg', 'forma_28a.svg', 
  'forma_30a.svg'
];

let svgsGraves = [];
let svgsMedios = [];
let svgsAgudos = [];
let capasActivas = [];

// =====================================================================
// // 2. MÁQUINA DE ESTADOS
// Un "switch" controla qué debe hacer el programa en cada momento.
// =====================================================================

let lienzoObra;
let obraAnchoBase = 450;
let obraAltoBase = 600;
let obraAncho, obraAlto;

const ESTADO_INICIO = 0;        
const ESTADO_SELECCION = 1;    
const ESTADO_FONDO = 2;        
const ESTADO_INTERACTIVO = 3;  
const ESTADO_CONTEMPLACION = 4; 

let estadoActual = ESTADO_INICIO;
let maxCapas = 30; 
let tiempoInicioContemplacion = 0; 
let posicionesDisponibles = [];

// =====================================================================
// COLORES Y PALETAS 
// =====================================================================

let colorPared = '#dcdcdc';
let colorObra = '#f4f4f2';

let paletas = [
  ['#e6007e', '#1b75bc', '#00aeef', '#75d1f0', '#fbcce6', '#939598', '#f1f0ea', '#ffffff'], // Obra 1
  ['#d7df23', '#fbcde3', '#000000', '#231f20', '#1c3f60', '#ffffff'],                      // Obra 2
  ['#e31b23', '#000000', '#414042', '#717073', '#b88395', '#fff200', '#1e3050', '#6b1b2f'], // Obra 3 
  ['#fff200', '#e6007e', '#fbcde3', '#00adef', '#1b75bc', '#939598', '#e6e7e8', '#ffffff']  // Obra 4
];
let paletaIndex = 0;

// =====================================================================
// RITMO GENERATIVO Y SEÑALES DE CONTROL
// =====================================================================

let ultimoTiempoSVG = 0;   
let cooldownSVG = 400; 
let ultimoTiempoVozMenu = 0; 
let ultimaFiguraDibujada = null; 

let umbralGolpe = 0.08;      
let contadorAplausos = 0;
let tiempoUltimoAplauso = 0;
let debounceAplauso = 100;   
let tiempoEsperaDoble = 1000; 

// =====================================================================
//3. VARIABLES DE SONIDO LÓGICA DE SONIDO Y PITCH (ml5.js)
// Usamos CREPE, un modelo de Deep Learning, para una detección de tono precisa.
// =====================================================================

let mic;
let audioIniciado = false;
let pitch;
const model_url = "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

let frec = 0;
let hayPitch = false;
let marcaUltimoPitch = 0;
let timeoutSinPitch = 300; 

let amp = 0;               
let umbralRuido = 0.02; 

let limiteGrave = 180; 
let limiteMedio = 350; 

// =====================================================================
// FUNCIONES NATIVAS DE P5.JS
// =====================================================================

function preload() {
  for (let nombre of archivosGraves) svgsGraves.push(loadImage(nombre));
  for (let nombre of archivosMedios) svgsMedios.push(loadImage(nombre));
  for (let nombre of archivosAgudos) svgsAgudos.push(loadImage(nombre));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  let altoMaximoConMargen = windowHeight * 0.9; 
  if (obraAltoBase > altoMaximoConMargen) {
    let relacion = altoMaximoConMargen / obraAltoBase;
    obraAncho = obraAnchoBase * relacion;
    obraAlto = obraAltoBase * relacion;
  } else {
    obraAncho = obraAnchoBase;
    obraAlto = obraAltoBase;
  }
  
  lienzoObra = createGraphics(obraAncho, obraAlto);
  mic = new p5.AudioIn();
}

function draw() {
  background(colorPared); 

  let obraX = (width - obraAncho) / 2;
  let obraY = (height - obraAlto) / 2;

  let hayDobleAplauso = false;

  if (audioIniciado) {
    amp = mic.getLevel();
    
    // --- LÓGICA INSTANTÁNEA DEL DOBLE APLAUSO ---
    if (amp > umbralGolpe && (millis() - tiempoUltimoAplauso > debounceAplauso)) {
      contadorAplausos++;
      tiempoUltimoAplauso = millis();
      
      if (contadorAplausos === 2) {
        hayDobleAplauso = true;
        contadorAplausos = 0; 
      }
    }
    
    if (contadorAplausos === 1 && (millis() - tiempoUltimoAplauso > tiempoEsperaDoble)) {
      contadorAplausos = 0;
    }
  }

  // --- MÁQUINA DE ESTADOS ---
  switch (estadoActual) {
    
    case ESTADO_INICIO:
      fill(20, 20, 20, 200);
      rect(obraX, obraY, obraAncho, obraAlto);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(16);
      text("Haz clic en la pantalla\npara habilitar el micrófono", width/2, height/2);
      break;

    case ESTADO_SELECCION:
      // --- DIBUJO GENERATIVO DE LAS PALETAS CON MÁRGENES ---
      let margen = obraAncho * 0.05; 
      let mitAncho = obraAncho / 2;
      let mitAlto = obraAlto / 2;
      
      let cuadroAncho = mitAncho - (margen * 2);
      let cuadroAlto = mitAlto - (margen * 2);

      fill(colorObra);
      noStroke();
      rect(obraX, obraY, obraAncho, obraAlto);

      for (let i = 0; i < paletas.length; i++) {
        let colQuad = i % 2;
        let rowQuad = Math.floor(i / 2);
        
        let startX = obraX + (colQuad * mitAncho) + margen;
        let startY = obraY + (rowQuad * mitAlto) + margen;
        
        let anchoFranja = cuadroAncho / paletas[i].length;

        for (let j = 0; j < paletas[i].length; j++) {
          fill(paletas[i][j]);
          noStroke();
          rect(startX + (j * anchoFranja), startY, anchoFranja, cuadroAlto);
        }
      }
      
      if (audioIniciado && hayPitch && amp > umbralRuido && amp < umbralGolpe) {
        if (millis() - ultimoTiempoVozMenu > 800) {
          paletaIndex = (paletaIndex + 1) % paletas.length;
          ultimoTiempoVozMenu = millis();
        }
      }

      if (hayDobleAplauso) {
        estadoActual = ESTADO_FONDO; 
      }

      let col = paletaIndex % 2;           
      let row = Math.floor(paletaIndex / 2); 
      let selX = obraX + (col * mitAncho) + margen;
      let selY = obraY + (row * mitAlto) + margen;
      
      noFill();
      strokeWeight(6);
      stroke(255); 
      rect(selX, selY, cuadroAncho, cuadroAlto);
      strokeWeight(2);
      stroke(0);
      rect(selX, selY, cuadroAncho, cuadroAlto);
      noStroke();
      break;

    case ESTADO_FONDO:
      lienzoObra.background(colorObra);
      capasActivas = [];
      ultimaFiguraDibujada = null; 
      
      posicionesDisponibles = [];
      let colGrid = 5; 
      let rowGrid = 6; 
      let celdaAncho = obraAncho / colGrid;
      let celdaAlto = obraAlto / rowGrid;

      for (let c = 0; c < colGrid; c++) {
        for (let r = 0; r < rowGrid; r++) {
          posicionesDisponibles.push({
            x: (c * celdaAncho) + (celdaAncho / 2),
            y: (r * celdaAlto) + (celdaAlto / 2)
          });
        }
      }
      posicionesDisponibles = shuffle(posicionesDisponibles);

      estadoActual = ESTADO_INTERACTIVO;
      break;

    case ESTADO_INTERACTIVO:
      lienzoObra.clear(); 
      lienzoObra.background(colorObra);
      
      if (hayDobleAplauso) {
        estadoActual = ESTADO_SELECCION;
      }

      if (audioIniciado && hayPitch && amp > umbralRuido && amp < umbralGolpe) {
        if (millis() - ultimoTiempoSVG > cooldownSVG) {
          
          let coleccionElegida;
          
          if (frec < limiteGrave) coleccionElegida = svgsGraves;
          else if (frec >= limiteGrave && frec < limiteMedio) coleccionElegida = svgsMedios;
          else coleccionElegida = svgsAgudos;
          
          if (coleccionElegida.length > 0 && posicionesDisponibles.length > 0) {
            let svgAzar = random(coleccionElegida);
            let intentos = 0;
            while (svgAzar === ultimaFiguraDibujada && intentos < 5) {
              svgAzar = random(coleccionElegida);
              intentos++;
            }
            ultimaFiguraDibujada = svgAzar; 

            let posElegida = posicionesDisponibles.pop();
            
            let jitterX = random(-obraAncho * 0.05, obraAncho * 0.05);
            let jitterY = random(-obraAlto * 0.05, obraAlto * 0.05);
            let localX = posElegida.x + jitterX;
            let localY = posElegida.y + jitterY;

            let nuevaForma = new FormaSVG(svgAzar, localX, localY, paletas[paletaIndex]);
            nuevaForma.angulo = random(-QUARTER_PI, QUARTER_PI); 
            
            capasActivas.push(nuevaForma);
          }
          ultimoTiempoSVG = millis(); 
        }
      }

      for (let capa of capasActivas) {
        capa.actualizar();
        capa.mostrar(lienzoObra);
      }
      
      image(lienzoObra, obraX, obraY);

      if (capasActivas.length >= maxCapas) {
        estadoActual = ESTADO_CONTEMPLACION;
        tiempoInicioContemplacion = millis();
      }
      break;

    case ESTADO_CONTEMPLACION:
      lienzoObra.clear(); 
      lienzoObra.background(colorObra);
      for (let capa of capasActivas) {
        capa.actualizar();
        capa.mostrar(lienzoObra);
      }
      image(lienzoObra, obraX, obraY);

      if (millis() - tiempoInicioContemplacion > 3000) {
        let nombreArchivo = 'Estudio_Higashi_' + year() + month() + day() + '_' + hour() + minute() + second() + '.png';
        save(lienzoObra, nombreArchivo); 
        estadoActual = ESTADO_SELECCION; 
      }
      break;
  }

  // --- TEXTO / MONITOR ---
  if (estadoActual !== ESTADO_INICIO) {
    push();
    let textoX = obraX + obraAncho + 100; 
    let textoY = obraY + obraAlto - 225; 
    
    textAlign(LEFT, TOP);
    textFont('Helvetica', 11); 
    textStyle(BOLD);
    fill(80); 
    text("KAZUHIRO HIGASHI", textoX, textoY);
    
    textStyle(ITALIC);
    fill(110);
    text("Estudio de composición interactiva, 2026", textoX, textoY + 16);
    
    stroke(180);
    strokeWeight(0.5);
    line(textoX, textoY + 36, textoX + 160, textoY + 36);
    
    noStroke();
    textStyle(NORMAL);
    fill(130);
    
    let informacionEnVivo;
    if (estadoActual === ESTADO_SELECCION) {
      informacionEnVivo = 
        "MODO SELECCIÓN DE PALETA\n\n" +
        "Volumen:  " + amp.toFixed(3) + "\n" +
        "Frecuencia:  " + frec.toFixed(1) + " Hz\n\n" +
        "Paleta Previsualizada: Obra " + (paletaIndex + 1);
    } else if (estadoActual === ESTADO_INTERACTIVO) {
      informacionEnVivo = 
        "Frecuencia (Pitch):  " + frec.toFixed(1) + " Hz\n\n" +
        "Volumen de Señal:  " + amp.toFixed(3) + "\n\n" +
        "Paleta Activa:  Obra " + (paletaIndex + 1) + "\n\n" +
        "Figuras en lienzo:  " + capasActivas.length + " / 30";
    } else if (estadoActual === ESTADO_CONTEMPLACION) {
      let tiempoRestante = Math.ceil(3 - (millis() - tiempoInicioContemplacion) / 1000);
      informacionEnVivo = 
        "COMPOSICIÓN FINALIZADA\n\n" +
        "Paleta Activa:  Obra " + (paletaIndex + 1) + "\n\n" +
        "Figuras en lienzo:  30 / 30\n\n" +
        "Guardando imagen en... " + Math.max(1, tiempoRestante) + "s";
    }
      
    text(informacionEnVivo, textoX, textoY + 48);

    fill(100);
    textStyle(ITALIC);
    if (estadoActual === ESTADO_SELECCION) {
      text("Controles de Menú:\nHablar/Cantar -> Navegar Paletas\n2 Aplausos rápidos -> Confirmar e Iniciar", textoX, textoY + 170);
    } else if (estadoActual === ESTADO_INTERACTIVO) {
      text("Controles de Obra:\nCantar/Tocar -> Dibuja Formas\n2 Aplausos rápidos -> Volver al Menú", textoX, textoY + 170);
    } else if (estadoActual === ESTADO_CONTEMPLACION) {
      text("Controles de Obra:\nTómate un momento para\nobservar tu composición.", textoX, textoY + 170);
    }
    pop();
  }
}

// =====================================================================
// FUNCIONES DE AUDIO Y PITCH
// =====================================================================

async function iniciarAudio() {
  if (audioIniciado) return;
  try {
    await userStartAudio();
    mic.start(() => {
      audioIniciado = true;
      startPitch();
      estadoActual = ESTADO_SELECCION; 
    }, (error) => {
      console.error("No se pudo iniciar el microfono", error);
    });
  } catch (error) {
    console.error("Error activando contexto de audio", error);
  }
}

function startPitch() {
  pitch = ml5.pitchDetection(model_url, getAudioContext(), mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (err) {
      setTimeout(getPitch, 120);
      return;
    }
    if (frequency) {
      frec = frequency;
      hayPitch = true;
      marcaUltimoPitch = millis();
    } else {
      if (millis() - marcaUltimoPitch > timeoutSinPitch) {
        hayPitch = false;
      }
    }
    getPitch(); 
  });
}

// =====================================================================
// INTERACCIONES INICIALES
// =====================================================================

function mousePressed() {
  if (estadoActual === ESTADO_INICIO) {
    iniciarAudio();
  }
}

// =====================================================================
// CLASE / PLANTILLA DE OBJETO (FormaSVG)
// =====================================================================

class FormaSVG {
  constructor(svgData, x, y, paleta, escalaPredefinida = null) {
    this.img = svgData;   
    this.x = x;           
    this.y = y;           
    this.color = random(paleta); 
    this.targetAlfa = 255; 
    this.alfa = 0; 
    this.angulo = 0; 
    
    if (escalaPredefinida) {
      this.escala = escalaPredefinida;
    } else {
      let factorPantalla = obraAncho / obraAnchoBase;
      this.escala = random(0.20, 0.40) * factorPantalla; 
    }
  }

  actualizar() {
    if (this.alfa < this.targetAlfa) {
      this.alfa += 35; 
    }
  }

  mostrar(pg) {
    pg.push(); 
    pg.translate(this.x, this.y);
    pg.rotate(this.angulo);
    pg.scale(this.escala);
    
    let c = pg.color(this.color);
    c.setAlpha(this.alfa);
    pg.tint(c); 
    
    pg.imageMode(CENTER);
    pg.image(this.img, 0, 0); 
    pg.pop(); 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}