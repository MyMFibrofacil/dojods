(() => {
  const form = document.getElementById("alumno-form");
  if (!form) return;

  const fieldLabels = {
    nombre: "Nombre",
    apellido: "Apellido",
    dni: "DNI",
    fecha_nacimiento: "Fecha de nacimiento",
    celular: "Celular",
    mail: "Mail",
    direccion: "Direccion",
    localidad: "Localidad",
    em1_nombre: "Contacto 1 Nombre",
    em1_celular: "Contacto 1 Celular",
    em1_relacion: "Contacto 1 Relacion",
    em2_nombre: "Contacto 2 Nombre",
    em2_celular: "Contacto 2 Celular",
    em2_relacion: "Contacto 2 Relacion",
  };

  const fieldOrder = Object.keys(fieldLabels);

  const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const buildCsv = (formData) => {
    const headerRow = fieldOrder.map((key) => csvEscape(fieldLabels[key]));
    const dataRow = fieldOrder.map((key) => csvEscape(formData.get(key)));
    return `${headerRow.join(",")}\r\n${dataRow.join(",")}\r\n`;
  };

  const sanitizeFilePart = (value) => {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 60);
  };

  let submitting = false;

  form.addEventListener("submit", (ev) => {
    // Evita loop si reenviamos con form.submit()
    if (submitting) return;

    ev.preventDefault();

    const formData = new FormData(form);
    const csv = buildCsv(formData);

    const csvInput = form.querySelector('input[name="excel_csv"]');
    if (csvInput) csvInput.value = csv;

    const first = sanitizeFilePart(formData.get("nombre"));
    const last = sanitizeFilePart(formData.get("apellido"));
    const base = [last, first].filter(Boolean).join("_") || "alumno";
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const nameInput = form.querySelector('input[name="excel_filename"]');
    if (nameInput) nameInput.value = `${base}_${dateStamp}.csv`;

    const mimeInput = form.querySelector('input[name="excel_mime"]');
    if (mimeInput && !mimeInput.value) mimeInput.value = "text/csv";

    // Debug opcional (podés dejarlo un rato y después sacar)
    // console.log("CSV length:", (csvInput?.value || "").length);

    submitting = true;
    form.submit();
  });
})();
