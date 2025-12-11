// ============================================
// GENERADOR DE PDF CON 2 INFORMES (SIN PÁGINAS EN BLANCO NI FONDOS NOSEADOS)
// ============================================

// Función principal que genera el PDF completo
async function generarPDFCompleto() {
  const boton = document.getElementById('btn-descargar-pdf');
  if (!boton) return alert('❌ Botón no encontrado');

  try {
    // 1. Desactivar botón
    boton.disabled = true;
    boton.textContent = '⏳ Generando PDF...';

    // 2. Obtener contenedores
    const informe1 = document.getElementById('informe-container');
    const informe2 = document.getElementById('hoja-pedido-container');

    // 3. Verificar que al menos uno existe y está visible
    if ((!informe1 || informe1.style.display === 'none') && 
        (!informe2 || informe2.style.display === 'none')) {
      alert('❌ No hay informe visible para generar PDF');
      return;
    }

    // 4. Crear PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    // 5. Informe 1 (si existe)
    if (informe1 && informe1.style.display !== 'none') {
      console.log('1️⃣ Capturando Informe 1...');
      await capturarInforme(pdf, informe1, true);
    }

    // 6. Informe 2 (si existe)
    if (informe2 && informe2.style.display !== 'none') {
      console.log('2️⃣ Capturando Informe 2...');
      await capturarInforme(pdf, informe2, false);
    }

    // 7. Generar nombre del archivo
    const cliente = informe1?.querySelector('#inf-cliente')?.textContent?.trim() || 
                    informe2?.querySelector('#hp-cliente')?.textContent?.trim() || 'informe';
    const fecha = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    
    // 8. Descargar
    pdf.save(`PA-Vidrio-${cliente}-${fecha}.pdf`);

  } catch (error) {
    console.error('❌ ERROR COMPLETO:', error);
    alert(`Error al generar PDF:\n${error.message}\n\nRevisa la consola (F12) para más detalles.`);
  } finally {
    // 9. Restaurar botón
    boton.disabled = false;
    boton.textContent = '📄 Generar PDF';
  }
}

// ============================================
// FUNCIÓN AUXILIAR: Captura un informe y lo ajusta (SIN FONDOS NOSEADOS)
// ============================================
async function capturarInforme(pdf, contenedor, esPrimero = true) {
  if (!contenedor || contenedor.style.display === 'none') return;
  
  console.log(`📄 Capturando ${contenedor.id}...`);

  // Esperar imágenes
  await esperarImagenes(contenedor);

  // Capturar con html2canvas
  const canvas = await html2canvas(contenedor, {
    scale: 1.5, // Reducido para mejor ajuste
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    
    // 🔥 CLAVE: FORZAR FONDO BLANCO EN TODO
    onclone: (clonedDoc) => {
      // Forzar fondo blanco en el body y contenedor
      clonedDoc.body.style.backgroundColor = '#ffffff';
      const contenedorClonado = clonedDoc.getElementById(contenedor.id);
      if (contenedorClonado) {
        contenedorClonado.style.backgroundColor = '#ffffff';
        contenedorClonado.style.setProperty('background-color', '#ffffff', 'important');
      }

      // Ocultar botones
      clonedDoc.querySelectorAll('.btn').forEach(btn => {
        btn.style.display = 'none';
      });
      
      // Forzar SOLO los fondos grises DESEADOS (titulos y th)
      const elementosCorrectos = clonedDoc.querySelectorAll('.bloque-titulo, .tabla-informe th');
      elementosCorrectos.forEach(el => {
        const estilo = window.getComputedStyle(el);
        if (estilo.backgroundColor && estilo.backgroundColor !== 'transparent') {
          el.style.backgroundColor = '#bbb'; // Color gris exacto que usas
        }
      });

      // BORRAR cualquier otro fondo no deseado
      clonedDoc.querySelectorAll('*').forEach(el => {
        const estilo = window.getComputedStyle(el);
        // Si NO es título ni th, pero tiene fondo gris suave = borrar
        if (!el.classList.contains('bloque-titulo') && 
            !el.closest('th') && 
            el.tagName !== 'TH' &&
            el.tagName !== 'BODY' &&
            el.id !== contenedor.id) {
          if (estilo.backgroundColor.includes('rgba') || 
              estilo.backgroundColor.includes('rgb(242') ||
              estilo.backgroundColor.includes('rgb(245')) {
            el.style.backgroundColor = 'transparent';
          }
        }
      });
    }
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Salto de página solo si NO es el primero
  if (!esPrimero) {
    pdf.addPage();
  }
  
  // Añadir imagen en la página actual
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  console.log(`✅ Informe capturado: ${imgWidth}x${imgHeight.toFixed(0)}mm`);
}

// ============================================
// FUNCIÓN AUXILIAR: Esperar imágenes
// ============================================
function esperarImagenes(container) {
  return new Promise((resolve) => {
    const images = container.querySelectorAll('img');
    if (images.length === 0) return resolve();
    
    let loaded = 0;
    images.forEach(img => {
      if (img.complete && img.naturalHeight > 0) {
        loaded++;
        if (loaded === images.length) resolve();
      } else {
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === images.length) resolve();
        };
      }
    });
  });
}

// ============================================
// INICIAR AL CARGAR PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('btn-descargar-pdf');
  if (boton) {
    boton.addEventListener('click', generarPDFCompleto);
    console.log('✅ Generador de PDF activado');
  } else {
    console.error('❌ No se encontró el botón #btn-descargar-pdf');
  }
});