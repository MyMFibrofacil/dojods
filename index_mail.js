(() => {
  const form = document.getElementById("alumno-form");
  if (!form) return;

  const daySelect = form.querySelector('select[name="fecha_nacimiento_dia"]');
  const monthSelect = form.querySelector('select[name="fecha_nacimiento_mes"]');
  const yearSelect = form.querySelector('select[name="fecha_nacimiento_anio"]');
  const fechaInput = form.querySelector('input[name="fecha_nacimiento"]');

  const pad2 = (value) => String(value).padStart(2, "0");

  const populateSelect = (select, values) => {
    if (!select || select.options.length > 1) return;
    values.forEach(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
  };

  const populateBirthdateSelects = () => {
    const days = Array.from({ length: 31 }, (_, i) => {
      const value = pad2(i + 1);
      return { value, label: value };
    });
    const months = Array.from({ length: 12 }, (_, i) => {
      const value = pad2(i + 1);
      return { value, label: value };
    });
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year -= 1) {
      years.push({ value: String(year), label: String(year) });
    }

    populateSelect(daySelect, days);
    populateSelect(monthSelect, months);
    populateSelect(yearSelect, years);
  };

  populateBirthdateSelects();

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

    if (fechaInput) {
      const day = daySelect?.value || "";
      const month = monthSelect?.value || "";
      const year = yearSelect?.value || "";
      fechaInput.value = day && month && year ? `${day}/${month}/${year}` : "";
    }

    const normalizePhone = (value) => {
      const digits = String(value || "").replace(/\D/g, "");
      if (digits.startsWith("549")) return digits.slice(3);
      return digits;
    };

    const celularInput = form.querySelector('input[name="celular"]');
    if (celularInput && celularInput.value) {
      celularInput.value = normalizePhone(celularInput.value);
    }

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
