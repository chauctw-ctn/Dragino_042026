const state = {
  enums: null,
  config: { devices: [] },
  selectedIndex: -1
};

const elements = {
  deviceItems: document.getElementById("deviceItems"),
  addDeviceBtn: document.getElementById("addDeviceBtn"),
  removeDeviceBtn: document.getElementById("removeDeviceBtn"),
  reloadBtn: document.getElementById("reloadBtn"),
  saveBtn: document.getElementById("saveBtn"),
  addTagBtn: document.getElementById("addTagBtn"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  toast: document.getElementById("toast"),
  jsonDialog: document.getElementById("jsonDialog"),
  jsonTextarea: document.getElementById("jsonTextarea"),
  closeDialogBtn: document.getElementById("closeDialogBtn"),
  loadJsonBtn: document.getElementById("loadJsonBtn"),
  copyJsonBtn: document.getElementById("copyJsonBtn"),
  tagRows: document.getElementById("tagRows"),
  deviceName: document.getElementById("deviceName"),
  deviceEnabled: document.getElementById("deviceEnabled"),
  deviceHost: document.getElementById("deviceHost"),
  devicePort: document.getElementById("devicePort"),
  deviceUnit: document.getElementById("deviceUnit"),
  deviceInterval: document.getElementById("deviceInterval"),
  deviceByteOrder: document.getElementById("deviceByteOrder"),
  deviceWordOrder: document.getElementById("deviceWordOrder")
};

function showToast(message, isError) {
  elements.toast.textContent = message;
  elements.toast.style.background = isError ? "#9f3b2f" : "#1b1f2a";
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function setSelectOptions(select, options, valueKey, labelKey) {
  select.innerHTML = "";
  options.forEach((opt) => {
    const optionEl = document.createElement("option");
    if (typeof opt === "string") {
      optionEl.value = opt;
      optionEl.textContent = opt;
    } else {
      optionEl.value = opt[valueKey];
      optionEl.textContent = opt[labelKey];
    }
    select.appendChild(optionEl);
  });
}

function createDevice() {
  return {
    id: generateId("dev"),
    name: "New Device",
    enabled: true,
    connection: {
      host: "192.168.1.100",
      port: 502,
      unitId: 1
    },
    protocol: {
      byteOrder: state.enums.byteOrder[0],
      wordOrder: state.enums.wordOrder[0]
    },
    polling: {
      interval: 60000
    },
    tags: []
  };
}

function createTag() {
  return {
    id: generateId("tag"),
    name: "new_tag",
    functionCode: state.enums.functionCode[0].value,
    address: 0,
    length: 1,
    type: state.enums.dataType[0],
    scale: 1,
    offset: 0,
    unit: ""
  };
}

function renderDeviceList() {
  elements.deviceItems.innerHTML = "";
  state.config.devices.forEach((device, index) => {
    const item = document.createElement("li");
    item.className = `device-card ${index === state.selectedIndex ? "active" : ""}`;
    item.innerHTML = `
      <h4>${device.name}</h4>
      <span>${device.connection.host}:${device.connection.port} | unit ${device.connection.unitId}</span>
    `;
    item.addEventListener("click", () => selectDevice(index));
    elements.deviceItems.appendChild(item);
  });
}

function fillDeviceForm(device) {
  const disabled = !device;
  [
    elements.deviceName,
    elements.deviceEnabled,
    elements.deviceHost,
    elements.devicePort,
    elements.deviceUnit,
    elements.deviceInterval,
    elements.deviceByteOrder,
    elements.deviceWordOrder
  ].forEach((el) => (el.disabled = disabled));

  elements.removeDeviceBtn.disabled = disabled;
  elements.addTagBtn.disabled = disabled;
  elements.importJsonBtn.disabled = disabled;
  elements.exportJsonBtn.disabled = disabled;

  if (!device) {
    elements.deviceName.value = "";
    elements.deviceEnabled.value = "true";
    elements.deviceHost.value = "";
    elements.devicePort.value = "";
    elements.deviceUnit.value = "";
    elements.deviceInterval.value = "";
    elements.deviceByteOrder.value = "";
    elements.deviceWordOrder.value = "";
    elements.tagRows.innerHTML = "";
    return;
  }

  elements.deviceName.value = device.name;
  elements.deviceEnabled.value = String(device.enabled);
  elements.deviceHost.value = device.connection.host;
  elements.devicePort.value = device.connection.port;
  elements.deviceUnit.value = device.connection.unitId;
  elements.deviceInterval.value = device.polling.interval;
  elements.deviceByteOrder.value = device.protocol.byteOrder;
  elements.deviceWordOrder.value = device.protocol.wordOrder;
  renderTags(device.tags);
}

function renderTags(tags) {
  elements.tagRows.innerHTML = "";
  tags.forEach((tag, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index;
    row.innerHTML = `
      <td><input type="text" value="${tag.name}" data-field="name" /></td>
      <td>
        <select data-field="functionCode">
          ${state.enums.functionCode
            .map(
              (fc) =>
                `<option value="${fc.value}" ${
                  Number(tag.functionCode) === fc.value ? "selected" : ""
                }>${fc.label}</option>`
            )
            .join("")}
        </select>
      </td>
      <td><input type="number" value="${tag.address}" data-field="address" /></td>
      <td><input type="number" value="${tag.length}" data-field="length" /></td>
      <td>
        <select data-field="type">
          ${state.enums.dataType
            .map(
              (type) =>
                `<option value="${type}" ${tag.type === type ? "selected" : ""}>${type}</option>`
            )
            .join("")}
        </select>
      </td>
      <td><input type="number" value="${tag.scale}" data-field="scale" step="0.1" /></td>
      <td><input type="number" value="${tag.offset}" data-field="offset" step="0.1" /></td>
      <td><input type="text" value="${tag.unit || ""}" data-field="unit" /></td>
      <td><button class="btn ghost small" data-action="remove">X</button></td>
    `;
    elements.tagRows.appendChild(row);
  });
}

function selectDevice(index) {
  state.selectedIndex = index;
  renderDeviceList();
  fillDeviceForm(state.config.devices[index]);
}

function updateSelectedDevice(patch) {
  if (state.selectedIndex < 0) return;
  const current = state.config.devices[state.selectedIndex];
  state.config.devices[state.selectedIndex] = {
    ...current,
    ...patch
  };
  renderDeviceList();
}

function bindFormEvents() {
  elements.deviceName.addEventListener("input", (event) => {
    updateSelectedDevice({ name: event.target.value });
  });

  elements.deviceEnabled.addEventListener("change", (event) => {
    updateSelectedDevice({ enabled: event.target.value === "true" });
  });

  elements.deviceHost.addEventListener("input", (event) => {
    updateSelectedDevice({
      connection: { ...state.config.devices[state.selectedIndex].connection, host: event.target.value }
    });
  });

  elements.devicePort.addEventListener("input", (event) => {
    updateSelectedDevice({
      connection: {
        ...state.config.devices[state.selectedIndex].connection,
        port: Number(event.target.value || 0)
      }
    });
  });

  elements.deviceUnit.addEventListener("input", (event) => {
    updateSelectedDevice({
      connection: {
        ...state.config.devices[state.selectedIndex].connection,
        unitId: Number(event.target.value || 0)
      }
    });
  });

  elements.deviceInterval.addEventListener("input", (event) => {
    updateSelectedDevice({
      polling: {
        ...state.config.devices[state.selectedIndex].polling,
        interval: Number(event.target.value || 0)
      }
    });
  });

  elements.deviceByteOrder.addEventListener("change", (event) => {
    updateSelectedDevice({
      protocol: {
        ...state.config.devices[state.selectedIndex].protocol,
        byteOrder: event.target.value
      }
    });
  });

  elements.deviceWordOrder.addEventListener("change", (event) => {
    updateSelectedDevice({
      protocol: {
        ...state.config.devices[state.selectedIndex].protocol,
        wordOrder: event.target.value
      }
    });
  });

  elements.tagRows.addEventListener("input", (event) => {
    const row = event.target.closest("tr");
    if (!row || state.selectedIndex < 0) return;
    const tagIndex = Number(row.dataset.index);
    const field = event.target.dataset.field;
    if (!field) return;

    const device = state.config.devices[state.selectedIndex];
    const nextTags = [...device.tags];
    const nextTag = { ...nextTags[tagIndex] };

    if (field === "functionCode") {
      nextTag[field] = Number(event.target.value);
    } else if (["address", "length"].includes(field)) {
      nextTag[field] = Number(event.target.value || 0);
    } else if (["scale", "offset"].includes(field)) {
      nextTag[field] = Number(event.target.value || 0);
    } else {
      nextTag[field] = event.target.value;
    }

    nextTags[tagIndex] = nextTag;
    updateSelectedDevice({ tags: nextTags });
  });

  elements.tagRows.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action !== "remove") return;
    const row = event.target.closest("tr");
    const tagIndex = Number(row.dataset.index);
    const device = state.config.devices[state.selectedIndex];
    const nextTags = device.tags.filter((_, idx) => idx !== tagIndex);
    updateSelectedDevice({ tags: nextTags });
    renderTags(nextTags);
  });
}

async function loadInitial() {
  try {
    state.enums = await fetchJson("/api/enums");
    setSelectOptions(elements.deviceByteOrder, state.enums.byteOrder);
    setSelectOptions(elements.deviceWordOrder, state.enums.wordOrder);

    state.config = await fetchJson("/api/config");
    state.selectedIndex = state.config.devices.length ? 0 : -1;
    renderDeviceList();
    fillDeviceForm(state.config.devices[state.selectedIndex]);
  } catch (err) {
    showToast("Khong the tai du lieu", true);
  }
}

async function saveConfig() {
  try {
    await fetchJson("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.config)
    });
    showToast("Da luu cau hinh");
  } catch (err) {
    showToast("Luu that bai", true);
  }
}

function openJsonDialog() {
  const device = state.config.devices[state.selectedIndex];
  elements.jsonTextarea.value = JSON.stringify(device.tags, null, 2);
  elements.jsonDialog.showModal();
}

function bindButtons() {
  elements.addDeviceBtn.addEventListener("click", () => {
    const device = createDevice();
    state.config.devices.push(device);
    selectDevice(state.config.devices.length - 1);
  });

  elements.removeDeviceBtn.addEventListener("click", () => {
    if (state.selectedIndex < 0) return;
    state.config.devices.splice(state.selectedIndex, 1);
    state.selectedIndex = state.config.devices.length ? 0 : -1;
    renderDeviceList();
    fillDeviceForm(state.config.devices[state.selectedIndex]);
  });

  elements.addTagBtn.addEventListener("click", () => {
    if (state.selectedIndex < 0) return;
    const device = state.config.devices[state.selectedIndex];
    const nextTags = [...device.tags, createTag()];
    updateSelectedDevice({ tags: nextTags });
    renderTags(nextTags);
  });

  elements.saveBtn.addEventListener("click", saveConfig);
  elements.reloadBtn.addEventListener("click", loadInitial);
  elements.importJsonBtn.addEventListener("click", openJsonDialog);
  elements.exportJsonBtn.addEventListener("click", openJsonDialog);

  elements.closeDialogBtn.addEventListener("click", () => elements.jsonDialog.close());

  elements.loadJsonBtn.addEventListener("click", () => {
    try {
      const tags = JSON.parse(elements.jsonTextarea.value);
      if (!Array.isArray(tags)) {
        showToast("JSON khong hop le", true);
        return;
      }
      updateSelectedDevice({ tags });
      renderTags(tags);
      elements.jsonDialog.close();
    } catch (err) {
      showToast("JSON khong hop le", true);
    }
  });

  elements.copyJsonBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.jsonTextarea.value);
      showToast("Da copy JSON");
    } catch (err) {
      showToast("Copy that bai", true);
    }
  });
}

bindFormEvents();
bindButtons();
loadInitial();
