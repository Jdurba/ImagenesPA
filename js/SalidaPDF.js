

function esperarImagenes() {
  return Promise.all(
    Array.from(document.images)
      .filter(img => !img.complete)
      .map(img => new Promise(resolve => {
        img.onload = img.onerror = resolve;
      }))
  );
}

function precargarImagenesDeWrapper(wrapper) {
  const imgs = Array.from(wrapper.querySelectorAll('img'));
  return Promise.all(
    imgs.map(img =>
      new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) return resolve();
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = () => resolve();
        tempImg.onerror = () => reject(new Error('Imagen no cargada: ' + img.src));
        tempImg.src = img.src;
      })
    )
  );
}


function extraerYprecargarImagenesHTML(htmlString) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  const imgs = Array.from(tempDiv.querySelectorAll('img'));
  return Promise.all(
    imgs.map(img => {
      return new Promise((resolve, reject) => {
        const tempImg = new Image();
        tempImg.crossOrigin = 'anonymous';
        tempImg.onload = () => resolve();
        tempImg.onerror = () => reject(new Error('Imagen no cargada: ' + img.src));
        tempImg.src = img.src;
      });
    })
  );
}









async function generarPDFCompleto(event) {
  const d = window.ultimosDatosInforme;
  if (!d) {
    alert('No hay datos para generar el PDF.');
    return;
  }

  const btnPDF = event.target;
  btnPDF.disabled = true;
  btnPDF.textContent = 'Generando PDF...';
  const pdfWrapper = document.getElementById('pdf-wrapper');
  pdfWrapper.style.display = 'block';
  pdfWrapper.style.width = '210mm';
  pdfWrapper.style.background = 'white';
  pdfWrapper.style.color = 'black';
  pdfWrapper.style.fontFamily = 'Arial, sans-serif';
  pdfWrapper.style.padding = '15mm';
  pdfWrapper.style.boxSizing = 'border-box';


  // Limitar altura para evitar página extra
  pdfWrapper.style.maxHeight = '297mm';
  pdfWrapper.style.overflow = 'hidden';

  // Esperar a que todas las imágenes estén cargadas
  function esperarImagenes() {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))
    );
  }

  await esperarImagenes();


  pdfWrapper.innerHTML = `
    <div style="padding: 15mm; page-break-after: always;">
      <div style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="font-size: 20px; margin: 0 0 10px 0;">PA VIDRIO MONTADO - HOJA DE FABRICACIÓN</h1>
        <div style="font-size: 11px;"><strong>Cliente:</strong> ${d.cliente} | <strong>Nº Pedido:</strong> ${d.numPedido} | <strong>Fecha:</strong> ${d.fecha}</div>
        <div style="font-size: 11px;"><strong>Comentarios:</strong> ${d.comentarios || 'Sin comentarios'}</div>
        <p style="font-weight: bold; margin: 10px 0 0 0; font-size: 13px;">${d.comentarios}</p>
      </div>

      ${d.mostrarPuerta ? `
      <div>
        <div style="background:#bbb; border:2px solid #999; padding:6px 15px; font-weight:bold; font-size:11px; margin:8px 0;">MEDIDAS DE PUERTA</div>
        <div style="font-weight:bold; font-size:11px; margin:10px 0 5px 0;">Perfiles Acabado ${d.acabado}</div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Tipo</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Longitud mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Retrac</th>
          </tr></thead>
          <tbody>
            ${d.perfilesPuerta.map(p => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${p.tipo}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(p.longitud)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(p.cantidad)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${p.retracInf || '-'}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <table style="width:100%; border-collapse:collapse; font-size:10px; margin-top:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Embellecedor</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Longitud mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
          </tr></thead>
          <tbody>
            ${d.embellecedorPuerta.map(e => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${e.tipo}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(e.longitud)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(e.cantidad)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div style="font-weight:bold; font-size:11px; margin:10px 0 5px 0;">Medidas de Cristales ${d.colorVidrio}</div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Vidrio Acabado</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Alto mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Ancho mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
          </tr></thead>
          <tbody>
            ${d.cristalesPuerta.map(c => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${c.descripcion}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.alto)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.ancho)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.cantidad)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${d.mostrarFijo ? `
      <div style="margin-top:15px;">
        <div style="background:#bbb; border:2px solid #999; padding:6px 15px; font-weight:bold; font-size:11px; margin:8px 0;">MEDIDAS DE FIJO</div>
        <div style="font-weight:bold; font-size:11px; margin:10px 0 5px 0;">Perfiles Acabado ${d.acabado}</div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Tipo</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Longitud mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
          </tr></thead>
          <tbody>
            ${d.perfilesFijo.map(p => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${p.tipo}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(p.longitud)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(p.cantidad)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <table style="width:100%; border-collapse:collapse; font-size:10px; margin-top:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Embellecedor</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Longitud mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
          </tr></thead>
          <tbody>
            ${d.embellecedorFijo.map(e => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${e.tipo}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(e.longitud)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(e.cantidad)}</td>
              </tr>`).join('')}
          </tbody>
        </table>

        <div style="font-weight:bold; font-size:11px; margin:10px 0 5px 0;">Medidas de Cristales ${d.colorVidrio}</div>
        <table style="width:100%; border-collapse:collapse; font-size:10px;">
          <thead><tr style="background:#ddd;">
            <th style="border:1px solid #333; padding:5px; text-align:left;">Vidrio Acabado</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Alto mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Ancho mm</th>
            <th style="border:1px solid #333; padding:5px; text-align:center;">Cantidad</th>
          </tr></thead>
          <tbody>
            ${d.cristalesFijo.map(c => `
              <tr>
                <td style="border:1px solid #333; padding:5px;">${c.descripcion}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.alto)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.ancho)}</td>
                <td style="border:1px solid #333; padding:5px; text-align:center;">${formatearNumero(c.cantidad)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

      <!-- PÁGINA 2: HOJA DE PEDIDO -->
      <div style="padding: 15mm; page-break-before: always;">
        <div style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; margin: 0 0 10px 0;">PA VIDRIO MONTADO - HOJA DE PEDIDO</h1>
          <div style="font-size: 11px;"><strong>Cliente:</strong> ${d.cliente} | <strong>Nº Pedido:</strong> ${d.numPedido} | <strong>Fecha:</strong> ${d.fecha}</div>
          <div style="font-size: 11px;"><strong>Comentarios:</strong> ${d.comentarios || 'Sin comentarios'}</div>
          <p style="font-weight: bold; margin: 10px 0 0 0; font-size: 13px;">${d.comentarios}</p>
        </div>

        ${d.mostrarPuerta ? `
        <div>
          <div style="background:#bbb; border:2px solid #999; padding:6px 15px; font-weight:bold; font-size:11px; margin:8px 0;">MEDIDAS PUERTA</div>
          <table style="width:100%; border-collapse:collapse; font-size:10px;">
            <thead><tr style="background:#ddd;">
              <th style="border:1px solid #333; padding:5px; text-align:left; width:35%;">Concepto</th>
              <th style="border:1px solid #333; padding:5px; text-align:left; width:50%;">Valor</th>
              <th style="border:1px solid #333; padding:5px; text-align:center; width:15%;">Cantidad</th>
            </tr></thead>
            <tbody>
              <tr><td style="border:1px solid #333; padding:5px;">Tipo</td><td style="border:1px solid #333; padding:5px;">CORREDERA</td><td style="border:1px solid #333; padding:5px; text-align:center;">${(d.perfilesPuerta[0]?.cantidad || 0) / 2}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Acabado</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.acabado}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Color Vidrio</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.colorVidrio}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Alto Puerta</td><td style="border:1px solid #333; padding:5px;">${formatearNumero(d.altoPuerta)}</td><td style="border:1px solid #333; padding:5px; text-align:center;">-</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Ancho Puerta</td><td style="border:1px solid #333; padding:5px;">${formatearNumero(d.anchoPuerta)}</td><td style="border:1px solid #333; padding:5px; text-align:center;">-</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Embellecedor 13×3</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.textoDivision}</td></tr>
            </tbody>
          </table>
        </div>` : ''}

        ${d.mostrarFijo ? `
        <div style="margin-top:15px;">
          <div style="background:#bbb; border:2px solid #999; padding:6px 15px; font-weight:bold; font-size:11px; margin:8px 0;">MEDIDAS FIJO</div>
          <table style="width:100%; border-collapse:collapse; font-size:10px;">
            <thead><tr style="background:#ddd;">
              <th style="border:1px solid #333; padding:5px; text-align:left; width:35%;">Concepto</th>
              <th style="border:1px solid #333; padding:5px; text-align:left; width:50%;">Valor</th>
              <th style="border:1px solid #333; padding:5px; text-align:center; width:15%;">Cantidad</th>
            </tr></thead>
            <tbody>
              <tr><td style="border:1px solid #333; padding:5px;">Tipo</td><td style="border:1px solid #333; padding:5px;">FIJO</td><td style="border:1px solid #333; padding:5px; text-align:center;">${(d.perfilesFijo[0]?.cantidad || 0) / 2}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Acabado</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.acabado}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Color Vidrio</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.colorVidrio}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Alto Fijo</td><td style="border:1px solid #333; padding:5px;">${formatearNumero(d.altoFijo)}</td><td style="border:1px solid #333; padding:5px; text-align:center;">-</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Ancho Fijo</td><td style="border:1px solid #333; padding:5px;">${formatearNumero(d.anchoFijo)}</td><td style="border:1px solid #333; padding:5px; text-align:center;">-</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Embellecedor 13×3</td><td colspan="2" style="border:1px solid #333; padding:5px;">${d.textoDivision}</td></tr>
              <tr><td style="border:1px solid #333; padding:5px;">Bastidor</td><td colspan="2" style="border:1px solid #333; padding:5px;">Perfiles ${d.acabado} - ${d.textoTipoFijo}</td></tr>
            </tbody>
          </table>
        </div>` : ''}
      </div>
    </div>
  `;

    // Extraer y precargar imágenes del string HTML
    await extraerYprecargarImagenesHTML(pdfWrapper.innerHTML);
    console.log('Imágenes precargadas desde string HTML');


  // Generar PDF
  const opt = {
    margin: 5,
    filename: `PA_${d.numPedido}_${d.cliente.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };


  // Log de depuración: imágenes detectadas
  console.log('Imágenes en pdfWrapper:', Array.from(pdfWrapper.querySelectorAll('img')).map(img => ({
  src: img.src,
  complete: img.complete,
  naturalWidth: img.naturalWidth,
  crossOrigin: img.crossOrigin
  }))); 


  try {
    await html2pdf().set(opt).from(pdfWrapper).save();
  } catch (err) {
    console.error('Error al generar el PDF:', err);
    alert('Error al generar el PDF. Revisa la consola.');
  } finally {
    pdfWrapper.style.display = 'none';
    btnPDF.disabled = false;
    btnPDF.textContent = 'Descargar PDF';
    // Restaurar estilos
    pdfWrapper.style.maxHeight = '';
    pdfWrapper.style.overflow = '';
  }
}

  <!-- Contenedor OCULTO que pegará html2pdf (2 páginas) -->
  <div id="pdf-wrapper" style="display:none;"></div>
