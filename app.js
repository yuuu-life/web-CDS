const STORAGE_KEY = "stock-control-data-v1";
const SESSION_KEY = "stock-control-session";
const THEME_KEY = "stock-control-theme";
const SIDEBAR_KEY = "stock-control-sidebar";
const users = [
  { username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { username: "usuario", password: "usuario123", role: "user", name: "Usuario" }
];

const defaultCategories = ["General", "Alimentos", "Limpieza", "Herramientas", "Repuestos"];

const elements = {
  loginView: document.getElementById("loginView"),
  appView: document.getElementById("appView"),
  loginForm: document.getElementById("loginForm"),
  loginUser: document.getElementById("loginUser"),
  loginPass: document.getElementById("loginPass"),
  loginError: document.getElementById("loginError"),
  logoutBtn: document.getElementById("logoutBtn"),
  sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  roleBadge: document.getElementById("roleBadge"),
  selectedDate: document.getElementById("selectedDate"),
  pageTitle: document.getElementById("pageTitle"),
  searchInput: document.getElementById("searchInput"),
  categoryFilter: document.getElementById("categoryFilter"),
  itemForm: document.getElementById("itemForm"),
  formTitle: document.getElementById("formTitle"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  itemName: document.getElementById("itemName"),
  itemCategory: document.getElementById("itemCategory"),
  itemDate: document.getElementById("itemDate"),
  itemQuantity: document.getElementById("itemQuantity"),
  itemMinStock: document.getElementById("itemMinStock"),
  itemUnit: document.getElementById("itemUnit"),
  itemPrice: document.getElementById("itemPrice"),
  itemNotes: document.getElementById("itemNotes"),
  categoryForm: document.getElementById("categoryForm"),
  categoryName: document.getElementById("categoryName"),
  categorySubmitBtn: document.getElementById("categorySubmitBtn"),
  cancelCategoryEditBtn: document.getElementById("cancelCategoryEditBtn"),
  categoryList: document.getElementById("categoryList"),
  itemsTable: document.getElementById("itemsTable"),
  tableCount: document.getElementById("tableCount"),
  metricItems: document.getElementById("metricItems"),
  metricUnits: document.getElementById("metricUnits"),
  metricLow: document.getElementById("metricLow"),
  metricValue: document.getElementById("metricValue"),
  movementLogTable: document.getElementById("movementLogTable"),
  movementLogCount: document.getElementById("movementLogCount"),
  exportDayBtn: document.getElementById("exportDayBtn"),
  exportAllBtn: document.getElementById("exportAllBtn")
};

let state = loadState();
let editingItemId = null;
let editingCategoryName = null;
let currentSession = getSession();
let currentTheme = localStorage.getItem(THEME_KEY) || "light";
let isSidebarCollapsed = localStorage.getItem(SIDEBAR_KEY) === "collapsed";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(dateValue));
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
  }).format(value);
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return {
      categories: defaultCategories,
      items: [],
      logs: []
    };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      categories: Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : defaultCategories,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : []
    };
  } catch {
    return {
      categories: defaultCategories,
      items: [],
      logs: []
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getSession() {
  const saved = localStorage.getItem(SESSION_KEY);

  if (saved === "active") {
    return { role: "admin", name: "Administrador" };
  }

  if (!saved) return null;

  try {
    const session = JSON.parse(saved);
    return session && session.role ? session : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  currentSession = {
    role: user.role,
    name: user.name
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
}

function isAdmin() {
  return currentSession && currentSession.role === "admin";
}

function isLoggedIn() {
  return Boolean(currentSession);
}

function showApp() {
  elements.loginView.classList.add("hidden");
  elements.appView.classList.remove("hidden");
  elements.roleBadge.textContent = isAdmin() ? "Administrador" : "Usuario normal";
  applyTheme(currentTheme);
  applySidebarState(isSidebarCollapsed);
  renderAll();
}

function showLogin() {
  elements.appView.classList.add("hidden");
  elements.loginView.classList.remove("hidden");
  document.body.classList.remove("user-role");
}

function icon(name) {
  return `<i class="fa-solid ${name}" aria-hidden="true"></i>`;
}

function renderAll() {
  renderCategoryControls();
  renderCategories();
  renderPermissions();
  renderItems();
  renderMovementLog();
}

function renderPermissions() {
  document.body.classList.toggle("user-role", !isAdmin());
}

function applyTheme(theme) {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("dark-theme", currentTheme === "dark");
  const themeLabel = currentTheme === "dark" ? "Modo claro" : "Modo oscuro";
  elements.themeToggleBtn.innerHTML =
    currentTheme === "dark"
      ? `${icon("fa-sun")} <span>${themeLabel}</span>`
      : `${icon("fa-moon")} <span>${themeLabel}</span>`;
  elements.themeToggleBtn.dataset.tooltip = themeLabel;
  elements.themeToggleBtn.setAttribute("title", themeLabel);
  localStorage.setItem(THEME_KEY, currentTheme);
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

function applySidebarState(collapsed) {
  isSidebarCollapsed = Boolean(collapsed);
  elements.appView.classList.toggle("sidebar-collapsed", isSidebarCollapsed);
  elements.sidebarToggleBtn.setAttribute(
    "aria-label",
    isSidebarCollapsed ? "Ampliar barra lateral" : "Minimizar barra lateral"
  );
  elements.sidebarToggleBtn.setAttribute("title", isSidebarCollapsed ? "Ampliar barra lateral" : "Minimizar barra lateral");
  localStorage.setItem(SIDEBAR_KEY, isSidebarCollapsed ? "collapsed" : "expanded");
}

function toggleSidebar() {
  applySidebarState(!isSidebarCollapsed);
}

function renderCategoryControls() {
  const currentFormCategory = elements.itemCategory.value || state.categories[0];
  const currentFilter = elements.categoryFilter.value || "all";

  elements.itemCategory.innerHTML = state.categories
    .map((category) => `<option value="${escapeAttribute(category)}">${escapeHtml(category)}</option>`)
    .join("");

  elements.categoryFilter.innerHTML = [
    '<option value="all">Todas las categorías</option>',
    ...state.categories.map((category) => `<option value="${escapeAttribute(category)}">${escapeHtml(category)}</option>`)
  ].join("");

  elements.itemCategory.value = state.categories.includes(currentFormCategory) ? currentFormCategory : state.categories[0];
  elements.categoryFilter.value = currentFilter === "all" || state.categories.includes(currentFilter) ? currentFilter : "all";
}

function renderCategories() {
  elements.categoryList.innerHTML = state.categories
    .map(
      (category) => `
        <span class="category-chip ${category === editingCategoryName ? "is-editing" : ""}">
          ${escapeHtml(category)}
          <button type="button" data-action="edit-category" data-category="${escapeAttribute(category)}" title="Editar categoría">
            ${icon("fa-pen")}
            Editar
          </button>
          <button type="button" data-action="delete-category" data-category="${escapeAttribute(category)}" title="Eliminar categoría">
            ${icon("fa-trash")}
            Eliminar
          </button>
        </span>
      `
    )
    .join("");
}

function getVisibleItems() {
  const selectedDate = elements.selectedDate.value;
  const search = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;

  return state.items
    .filter((item) => item.date === selectedDate)
    .filter((item) => category === "all" || item.category === category)
    .filter((item) => {
      if (!search) return true;
      return [item.name, item.category, item.notes].some((value) => String(value || "").toLowerCase().includes(search));
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function renderItems() {
  const selectedDate = elements.selectedDate.value;
  const visibleItems = getVisibleItems();

  elements.pageTitle.textContent = `Stock del ${formatDate(selectedDate)}`;
  elements.tableCount.textContent = visibleItems.length;

  if (!visibleItems.length) {
    elements.itemsTable.innerHTML = '<tr><td colspan="7" class="empty-row">No hay items cargados para esta fecha.</td></tr>';
  } else {
    elements.itemsTable.innerHTML = visibleItems.map(renderItemRow).join("");
  }

  renderMetrics(visibleItems);
}

function renderItemRow(item) {
  const isLow = Number(item.quantity) <= Number(item.minStock);
  const notes = item.notes ? `<div class="item-notes">${escapeHtml(item.notes)}</div>` : "";
  const unit = item.unit ? ` ${escapeHtml(item.unit)}` : "";

  return `
    <tr>
      <td>
        <div class="item-name">${escapeHtml(item.name)}</div>
        ${notes}
      </td>
      <td>${escapeHtml(item.category)}</td>
      <td class="${isLow ? "status-low" : ""}">${Number(item.quantity)}${unit}</td>
      <td>${Number(item.minStock)}${unit}</td>
      <td>${formatDate(item.date)}</td>
      <td>${formatMoney(Number(item.price || 0))}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-action="edit-item" data-id="${item.id}">
            ${icon("fa-pen")}
            Editar
          </button>
          <button type="button" data-action="delete-item" data-id="${item.id}">
            ${icon("fa-trash")}
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderMetrics(items) {
  const totalUnits = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const lowStock = items.filter((item) => Number(item.quantity) <= Number(item.minStock)).length;
  const value = items.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.price || 0), 0);

  elements.metricItems.textContent = items.length;
  elements.metricUnits.textContent = totalUnits;
  elements.metricLow.textContent = lowStock;
  elements.metricValue.textContent = formatMoney(value);
}

function getUserLabel() {
  if (!currentSession) return "Sin sesión";
  return `${currentSession.name} (${currentSession.role === "admin" ? "admin" : "usuario"})`;
}

function getItemSnapshot(item) {
  return {
    name: item.name,
    category: item.category,
    date: item.date,
    quantity: Number(item.quantity || 0),
    minStock: Number(item.minStock || 0),
    unit: item.unit || "",
    price: Number(item.price || 0),
    notes: item.notes || ""
  };
}

function buildEditDetail(before, after) {
  const fields = [
    ["name", "nombre"],
    ["category", "categoría"],
    ["date", "fecha"],
    ["quantity", "cantidad"],
    ["minStock", "mínimo"],
    ["unit", "unidad"],
    ["price", "precio"],
    ["notes", "observaciones"]
  ];

  const changes = fields
    .filter(([key]) => String(before[key] ?? "") !== String(after[key] ?? ""))
    .map(([, label]) => label);

  return changes.length ? `Campos modificados: ${changes.join(", ")}` : "Sin cambios visibles";
}

function addStockLog(action, item, beforeItem = null, detail = "") {
  const after = getItemSnapshot(item);
  const before = beforeItem ? getItemSnapshot(beforeItem) : null;

  state.logs.unshift({
    id: createId(),
    timestamp: new Date().toISOString(),
    user: getUserLabel(),
    action,
    itemName: after.name,
    category: after.category,
    stockDate: after.date,
    quantityBefore: before ? before.quantity : null,
    quantityAfter: action === "delete" ? null : after.quantity,
    detail
  });
}

function renderMovementLog() {
  const logs = state.logs.slice(0, 80);
  elements.movementLogCount.textContent = state.logs.length;

  if (!logs.length) {
    elements.movementLogTable.innerHTML =
      '<tr><td colspan="8" class="empty-row">Todavía no hay movimientos registrados.</td></tr>';
    return;
  }

  elements.movementLogTable.innerHTML = logs.map(renderMovementLogRow).join("");
}

function renderMovementLogRow(log) {
  const actionLabels = {
    add: "Agregado",
    edit: "Editado",
    delete: "Eliminado"
  };
  const quantity =
    log.action === "edit"
      ? `${log.quantityBefore ?? "-"} → ${log.quantityAfter ?? "-"}`
      : log.action === "delete"
        ? log.quantityBefore ?? "-"
        : log.quantityAfter ?? "-";

  return `
    <tr>
      <td>${formatDateTime(log.timestamp)}</td>
      <td>${escapeHtml(log.user)}</td>
      <td>${escapeHtml(actionLabels[log.action] || log.action)}</td>
      <td>
        <div class="item-name">${escapeHtml(log.itemName)}</div>
        <div class="item-notes">${escapeHtml(log.category)}</div>
      </td>
      <td>${escapeHtml(String(quantity))}</td>
      <td>${formatDate(log.stockDate)}</td>
      <td>${escapeHtml(log.detail || "-")}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-action="delete-log" data-id="${escapeAttribute(log.id)}">
            ${icon("fa-trash")}
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `;
}

function deleteMovementLog(logId) {
  if (!isAdmin()) {
    alert("Solo el administrador puede borrar registros de movimientos.");
    return;
  }

  const log = state.logs.find((current) => current.id === logId);
  if (!log) return;

  if (!confirm(`Eliminar el registro de "${log.itemName}"? Esta acción no elimina items de stock.`)) {
    return;
  }

  state.logs = state.logs.filter((current) => current.id !== logId);
  saveState();
  renderMovementLog();
}

function resetItemForm() {
  editingItemId = null;
  elements.itemForm.reset();
  elements.itemDate.value = elements.selectedDate.value;
  elements.itemMinStock.value = "0";
  elements.itemPrice.value = "0";
  elements.formTitle.textContent = "Agregar item";
  elements.cancelEditBtn.classList.add("hidden");
  renderCategoryControls();
}

function fillItemForm(item) {
  editingItemId = item.id;
  elements.formTitle.textContent = "Editar item";
  elements.cancelEditBtn.classList.remove("hidden");
  elements.itemName.value = item.name;
  elements.itemCategory.value = item.category;
  elements.itemDate.value = item.date;
  elements.itemQuantity.value = item.quantity;
  elements.itemMinStock.value = item.minStock;
  elements.itemUnit.value = item.unit || "";
  elements.itemPrice.value = item.price || 0;
  elements.itemNotes.value = item.notes || "";
  elements.itemName.focus();
}

function handleItemSubmit(event) {
  event.preventDefault();
  const previousItem = editingItemId ? state.items.find((current) => current.id === editingItemId) : null;

  const item = {
    id: editingItemId || createId(),
    name: elements.itemName.value.trim(),
    category: elements.itemCategory.value,
    date: elements.itemDate.value,
    quantity: Number(elements.itemQuantity.value),
    minStock: Number(elements.itemMinStock.value),
    unit: elements.itemUnit.value.trim(),
    price: Number(elements.itemPrice.value || 0),
    notes: elements.itemNotes.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (editingItemId) {
    addStockLog("edit", item, previousItem, previousItem ? buildEditDetail(getItemSnapshot(previousItem), getItemSnapshot(item)) : "");
    state.items = state.items.map((current) => (current.id === editingItemId ? item : current));
  } else {
    state.items.push(item);
    addStockLog("add", item, null, `Stock inicial: ${item.quantity}`);
  }

  elements.selectedDate.value = item.date;
  saveState();
  resetItemForm();
  renderAll();
}

function handleCategorySubmit(event) {
  event.preventDefault();

  if (!isAdmin()) {
    alert("Solo el administrador puede crear o modificar categorías.");
    return;
  }

  const category = elements.categoryName.value.trim();

  if (!category) return;

  const exists = state.categories.some(
    (current) => current.toLowerCase() === category.toLowerCase() && current !== editingCategoryName
  );

  if (exists) {
    alert("Ya existe una categoría con ese nombre.");
    return;
  }

  if (editingCategoryName) {
    state.categories = state.categories.map((current) => (current === editingCategoryName ? category : current));
    state.items = state.items.map((item) => (item.category === editingCategoryName ? { ...item, category } : item));
    resetCategoryForm();
  } else {
    state.categories.push(category);
  }

  state.categories.sort((a, b) => a.localeCompare(b, "es"));
  saveState();
  renderAll();
}

function editCategory(category) {
  if (!isAdmin()) {
    alert("Solo el administrador puede editar categorías.");
    return;
  }

  editingCategoryName = category;
  elements.categoryName.value = category;
  elements.categoryName.focus();
  elements.categorySubmitBtn.innerHTML = `${icon("fa-floppy-disk")} Guardar cambio`;
  elements.cancelCategoryEditBtn.classList.remove("hidden");
  renderAll();
}

function deleteCategory(category) {
  if (!isAdmin()) {
    alert("Solo el administrador puede eliminar categorías.");
    return;
  }

  if (state.categories.length === 1) {
    alert("Debe quedar al menos una categoría.");
    return;
  }

  const remainingCategories = state.categories.filter((current) => current !== category);
  const replacementCategory = remainingCategories.includes("General") ? "General" : remainingCategories[0];
  const itemsInCategory = state.items.filter((item) => item.category === category).length;

  if (itemsInCategory > 0) {
    const shouldDelete = confirm(
      `La categoría "${category}" tiene ${itemsInCategory} item(s). Si la eliminás, pasarán a "${replacementCategory}".`
    );

    if (!shouldDelete) return;
  } else if (!confirm(`Eliminar la categoría "${category}"?`)) {
    return;
  }

  state.categories = remainingCategories;
  state.items = state.items.map((item) => (item.category === category ? { ...item, category: replacementCategory } : item));

  if (editingCategoryName === category) {
    resetCategoryForm();
  }

  saveState();
  renderAll();
}

function resetCategoryForm() {
  editingCategoryName = null;
  elements.categoryForm.reset();
  elements.categorySubmitBtn.innerHTML = `${icon("fa-plus")} Agregar`;
  elements.cancelCategoryEditBtn.classList.add("hidden");
}

function exportItems(items, filename) {
  if (!items.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const rows = items.map((item) => ({
    Item: item.name,
    Categoria: item.category,
    Cantidad: item.quantity,
    Minimo: item.minStock,
    Unidad: item.unit || "",
    Fecha: formatDate(item.date),
    PrecioUnitario: item.price || 0,
    ValorTotal: Number(item.quantity || 0) * Number(item.price || 0),
    Observaciones: item.notes || ""
  }));

  const table = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr>${Object.keys(rows[0]).map((key) => `<th>${escapeHtml(key)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows
              .map((row) => `<tr>${Object.values(row).map((value) => `<td>${escapeHtml(String(value))}</td>`).join("")}</tr>`)
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([table], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = users.find(
    (current) => current.username === elements.loginUser.value && current.password === elements.loginPass.value
  );

  if (user) {
    saveSession(user);
    elements.loginForm.reset();
    elements.loginError.textContent = "";
    showApp();
    return;
  }

  elements.loginError.textContent = "Usuario o contraseña incorrectos.";
});

elements.logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  currentSession = null;
  showLogin();
});

elements.sidebarToggleBtn.addEventListener("click", toggleSidebar);
elements.themeToggleBtn.addEventListener("click", toggleTheme);

elements.selectedDate.addEventListener("change", () => {
  if (!elements.selectedDate.value) {
    elements.selectedDate.value = today();
  }

  elements.itemDate.value = elements.selectedDate.value;
  renderItems();
});

elements.searchInput.addEventListener("input", renderItems);
elements.categoryFilter.addEventListener("change", renderItems);
elements.itemForm.addEventListener("submit", handleItemSubmit);
elements.categoryForm.addEventListener("submit", handleCategorySubmit);
elements.cancelEditBtn.addEventListener("click", resetItemForm);
elements.cancelCategoryEditBtn.addEventListener("click", () => {
  resetCategoryForm();
  renderCategories();
});

elements.movementLogTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.dataset.action !== "delete-log") return;

  deleteMovementLog(button.dataset.id);
});

elements.itemsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const item = state.items.find((current) => current.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.action === "edit-item") {
    fillItemForm(item);
  }

  if (button.dataset.action === "delete-item" && confirm(`Eliminar "${item.name}"?`)) {
    addStockLog("delete", item, item, "Item eliminado del stock");
    state.items = state.items.filter((current) => current.id !== item.id);
    saveState();
    renderAll();
  }
});

elements.categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const category = button.dataset.category;
  if (button.dataset.action === "edit-category") editCategory(category);
  if (button.dataset.action === "delete-category") deleteCategory(category);
});

elements.exportDayBtn.addEventListener("click", () => {
  const items = state.items.filter((item) => item.date === elements.selectedDate.value);
  exportItems(items, `stock-${elements.selectedDate.value}.xls`);
});

elements.exportAllBtn.addEventListener("click", () => {
  const items = [...state.items].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, "es"));
  exportItems(items, "stock-completo.xls");
});

elements.selectedDate.value = today();
elements.itemDate.value = elements.selectedDate.value;
applyTheme(currentTheme);
applySidebarState(isSidebarCollapsed);

if (isLoggedIn()) {
  showApp();
} else {
  showLogin();
}
