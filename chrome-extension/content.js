(function () {
  if (document.getElementById("guerrilla-crm-fab")) return;

  // --- ACCUMULATED STATE ---
  let selectedText = "";
  let accumulatedMessages = [];
  let selectedCustomerId = null;

  // --- 1. Create FAB Toolbar (Floating on text selection) ---
  const fab = document.createElement("div");
  fab.id = "guerrilla-crm-fab";
  fab.innerHTML = `
    <button class="crm-fab-btn customer" id="crm-fab-cust">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      Customer
    </button>
    <div class="crm-fab-divider"></div>
    <button class="crm-fab-btn sales" id="crm-fab-sales">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path><polygon points="10 2 8 6 12 6"></polygon></svg>
      Sales
    </button>
  `;
  document.body.appendChild(fab);

  // --- 2. Create Cart Button (Bottom right corner) ---
  const cartBtn = document.createElement("button");
  cartBtn.id = "guerrilla-crm-cart";
  cartBtn.style.display = "none"; // Hidden when no messages yet
  cartBtn.innerHTML = `
    <span>Analyze CRM</span>
    <span id="crm-cart-badge">0</span>
  `;
  document.body.appendChild(cartBtn);

  // --- 3. Create Main Modal (Review) ---
  const backdrop = document.createElement("div");
  backdrop.id = "guerrilla-crm-modal-backdrop";
  document.body.appendChild(backdrop);

  const modal = document.createElement("div");
  modal.id = "guerrilla-crm-modal";
  modal.innerHTML = `
    <h3>Review Conversation <span id="crm-modal-close">&times;</span></h3>

    <!-- Step 1: Review captured messages -->
    <div id="crm-step-1" class="crm-step active">
      <span class="crm-label">Temporarily saved messages</span>
      <div id="crm-msg-list" class="crm-msg-list"></div>
      
      <button id="crm-analyze-btn" class="crm-btn">Send to AI for analysis &rarr;</button>
    </div>

    <!-- Step 2: AI Result & Lead Options (2-Column Form) -->
    <div id="crm-step-2" class="crm-step">

      <!-- Lead Option Selector -->
      <div class="crm-lead-options">
        <label class="crm-radio-label crm-radio-active" id="crm-radio-new-label">
          <input type="radio" name="crm-lead-mode" value="new" id="crm-radio-new" checked />
          <span class="crm-radio-icon">➕</span> Create New Lead
        </label>
        <label class="crm-radio-label" id="crm-radio-existing-label">
          <input type="radio" name="crm-lead-mode" value="existing" id="crm-radio-existing" />
          <span class="crm-radio-icon">🔍</span> Select Existing Lead
        </label>
      </div>

      <!-- Existing Lead Search Panel (hidden by default) -->
      <div id="crm-existing-panel" style="display:none">
        <div class="crm-form-group">
          <span class="crm-form-label">Search by Phone or Name</span>
          <input type="text" id="crm-search-existing" class="crm-form-input" placeholder="Enter phone number or name..." />
        </div>
        <div id="crm-search-results" class="crm-search-results"></div>
      </div>

      <div class="crm-form-grid">
        <!-- LEFT COLUMN: CUSTOMER PROFILE -->
        <div class="crm-form-col">
          <div class="crm-col-title">👤 Profile Info</div>
          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Customer Name</span>
              <input type="text" id="crm-form-name" class="crm-form-input" placeholder="John Doe" />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Phone Number</span>
              <input type="text" id="crm-form-phone" class="crm-form-input" placeholder="09xxxx" />
            </div>
          </div>
          <div class="crm-form-group">
            <span class="crm-form-label">Company Name</span>
            <input type="text" id="crm-form-company" class="crm-form-input" placeholder="Acme Corp..." />
          </div>
          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Job Title</span>
              <input type="text" id="crm-form-job" class="crm-form-input" placeholder="Director..." />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Source</span>
              <input type="text" id="crm-form-source" class="crm-form-input" placeholder="Zalo, FB..." />
            </div>
          </div>
          <div class="crm-form-group">
            <span class="crm-form-label">Address</span>
            <input type="text" id="crm-form-address" class="crm-form-input" placeholder="Street, City..." />
          </div>
          <div class="crm-form-group" style="margin-bottom:0">
            <span class="crm-form-label">Email</span>
            <input type="email" id="crm-form-email" class="crm-form-input" placeholder="customer@email.com" />
          </div>
        </div>

        <!-- RIGHT COLUMN: SALES CONTEXT -->
        <div class="crm-form-col">
          <div class="crm-col-title">💼 Sales Context</div>
          
          <input type="hidden" id="crm-customer-id" />

          <div class="crm-form-group">
            <span class="crm-form-label">Intent</span>
            <input type="text" id="crm-form-intent" class="crm-form-input" />
          </div>

          <div class="crm-form-group">
            <span class="crm-form-label">Pain Points</span>
            <input type="text" id="crm-form-pain" class="crm-form-input" placeholder="Customer challenges..." />
          </div>

          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Budget</span>
              <input type="number" id="crm-form-budget" class="crm-form-input" />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Score (1-10)</span>
              <input type="number" id="crm-form-score" class="crm-form-input" />
            </div>
          </div>
          <div class="crm-form-group">
            <span class="crm-form-label">AI Summary</span>
            <textarea id="crm-form-summary" class="crm-form-input" style="height:35px"></textarea>
          </div>
          <div class="crm-form-group" style="margin-bottom:0">
            <span class="crm-form-label">Sentiment</span>
            <select id="crm-form-sentiment" class="crm-form-input">
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>

          <!-- Dynamic Custom Fields Container -->
          <div id="crm-custom-fields-container"></div>
        </div>
      </div> <!-- End Grid -->

      <button id="crm-save-btn" class="crm-btn-success">Save to Database ✓</button>
      <button id="crm-back-1-btn" class="crm-btn-secondary">&larr; Back to review messages</button>
      
      <div id="crm-status-msg" class="crm-status">Saved successfully!</div>
      <div id="crm-error-msg" class="crm-error"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // --- UTILS ---
  function updateCartBadge() {
    const badge = document.getElementById("crm-cart-badge");
    badge.textContent = accumulatedMessages.length;
    cartBtn.style.display = accumulatedMessages.length > 0 ? "flex" : "none";
  }

  function addMessageToCart(role, text) {
    if (!text.trim()) return;
    accumulatedMessages.push({ role, text: text.trim() });
    updateCartBadge();
    fab.style.display = "none";
    window.getSelection().removeAllRanges();
  }

  function closeModal() {
    modal.style.display = "none";
    backdrop.style.display = "none";
  }

  function showStep(n) {
    document.querySelectorAll(".crm-step").forEach((s) => s.classList.remove("active"));
    document.getElementById("crm-step-" + n).classList.add("active");
  }

  // --- EVENT: Show FAB toolbar on text selection ---
  document.addEventListener("mouseup", (e) => {
    if (e.target.closest("#guerrilla-crm-modal") || e.target.closest("#guerrilla-crm-fab") || e.target.closest("#guerrilla-crm-cart")) return;

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 2) { 
      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      fab.style.display = "flex";
      fab.style.top = (rect.top + window.scrollY - fab.offsetHeight - 5) + "px";
      fab.style.left = (rect.left + window.scrollX + (rect.width / 2) - (fab.offsetWidth / 2)) + "px";
    } else {
      fab.style.display = "none";
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest("#guerrilla-crm-modal") && !e.target.closest("#guerrilla-crm-fab")) {
      fab.style.display = "none";
    }
  });

  document.getElementById("crm-fab-cust").addEventListener("click", () => addMessageToCart("customer", selectedText));
  document.getElementById("crm-fab-sales").addEventListener("click", () => addMessageToCart("sales", selectedText));

  cartBtn.addEventListener("click", () => {
    renderModalMessageList();
    showStep(1);
    backdrop.style.display = "block";
    modal.style.display = "block";
  });

  document.getElementById("crm-modal-close").addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  // --- RENDER CHAT MESSAGES IN MODAL ---
  function renderModalMessageList() {
    const list = document.getElementById("crm-msg-list");
    list.innerHTML = "";
    
    if (accumulatedMessages.length === 0) {
      list.innerHTML = "<div style='padding:10px;text-align:center;color:#888'>No messages captured yet. Highlight text on the page to add here.</div>";
      document.getElementById("crm-analyze-btn").disabled = true;
      return;
    }
    document.getElementById("crm-analyze-btn").disabled = false;

    accumulatedMessages.forEach((msg, idx) => {
      const item = document.createElement("div");
      item.className = "crm-msg-item";
      
      const header = document.createElement("div");
      header.className = "crm-msg-header";

      const sel = document.createElement("select");
      sel.className = msg.role;
      sel.innerHTML = `
        <option value="customer" ${msg.role === "customer" ? "selected" : ""}>Customer</option>
        <option value="sales" ${msg.role === "sales" ? "selected" : ""}>Sales</option>
      `;
      sel.addEventListener("change", (e) => {
        msg.role = e.target.value;
        sel.className = e.target.value;
      });

      const del = document.createElement("div");
      del.className = "crm-delete-msg";
      del.innerHTML = "&times;";
      del.addEventListener("click", () => {
        accumulatedMessages.splice(idx, 1);
        renderModalMessageList();
        updateCartBadge();
      });

      header.appendChild(sel);
      header.appendChild(del);

      const txt = document.createElement("div");
      txt.className = "crm-msg-text";
      txt.innerText = msg.text;

      item.appendChild(header);
      item.appendChild(txt);
      list.appendChild(item);
    });
  }

  function getCurrentChannel() {
    const host = window.location.hostname;
    if (host.includes("zalo.me")) return "ZALO";
    if (host.includes("messenger.com") || host.includes("facebook.com")) return "MESSENGER";
    if (host.includes("whatsapp.com")) return "WHATSAPP";
    return "UNKNOWN";
  }

  async function searchCustomers(query) {
    const url = `http://localhost:3000/api/customers${query ? "?phone=" + encodeURIComponent(query) : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error: " + res.status);
    return await res.json();
  }

  // --- LEAD MODE RADIO BUTTONS ---
  document.getElementById("crm-radio-new").addEventListener("change", () => {
    document.getElementById("crm-existing-panel").style.display = "none";
    document.getElementById("crm-radio-new-label").classList.add("crm-radio-active");
    document.getElementById("crm-radio-existing-label").classList.remove("crm-radio-active");
    document.getElementById("crm-customer-id").value = "";
    document.getElementById("crm-save-btn").textContent = "Create New Lead & Save ✓";
    // Enable profile fields for editing
    toggleProfileFields(false);
  });

  document.getElementById("crm-radio-existing").addEventListener("change", () => {
    document.getElementById("crm-existing-panel").style.display = "block";
    document.getElementById("crm-radio-existing-label").classList.add("crm-radio-active");
    document.getElementById("crm-radio-new-label").classList.remove("crm-radio-active");
    document.getElementById("crm-save-btn").textContent = "Update Customer & Save Chat ✓";
  });

  function toggleProfileFields(readonly) {
    ["crm-form-name", "crm-form-phone", "crm-form-company", "crm-form-job", "crm-form-source", "crm-form-address", "crm-form-email"].forEach(id => {
      document.getElementById(id).readOnly = readonly;
    });
  }

  // --- EXISTING LEAD SEARCH ---
  let searchTimeout = null;
  document.getElementById("crm-search-existing").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => performLeadSearch(e.target.value), 400);
  });

  async function performLeadSearch(query) {
    const resultsDiv = document.getElementById("crm-search-results");
    if (!query || query.length < 2) {
      resultsDiv.innerHTML = "<div class='crm-search-empty'>Type at least 2 characters to search...</div>";
      return;
    }
    resultsDiv.innerHTML = "<div class='crm-search-empty'>Searching...</div>";
    try {
      const customers = await searchCustomers(query);
      if (customers.length === 0) {
        resultsDiv.innerHTML = "<div class='crm-search-empty'>No customers found. Try a different search.</div>";
        return;
      }
      resultsDiv.innerHTML = "";
      customers.forEach(c => {
        const item = document.createElement("div");
        item.className = "crm-search-item";
        item.innerHTML = `<strong>${c.name || "Unnamed"}</strong> <span style="color:#888">${c.phone || ""}</span>`;
        item.addEventListener("click", () => {
          selectExistingCustomer(c);
          resultsDiv.innerHTML = "";
        });
        resultsDiv.appendChild(item);
      });
    } catch {
      resultsDiv.innerHTML = "<div class='crm-search-empty'>Search failed. Check if the server is running.</div>";
    }
  }

  function selectExistingCustomer(c) {
    document.getElementById("crm-customer-id").value = c.id;
    document.getElementById("crm-form-name").value = c.name || "";
    document.getElementById("crm-form-phone").value = c.phone || "";
    document.getElementById("crm-form-email").value = c.email || "";
    document.getElementById("crm-form-address").value = c.address || "";
    document.getElementById("crm-form-company").value = c.company || "";
    document.getElementById("crm-form-job").value = c.job_title || "";
    document.getElementById("crm-form-source").value = c.source || "";
    document.getElementById("crm-save-btn").textContent = "Update Customer & Save Chat ✓";
    toggleProfileFields(true);

    // Load custom field values for this customer
    loadCustomFieldValues(c.id);
  }

  // --- DYNAMIC CUSTOM FIELDS ---
  async function loadCustomFields() {
    try {
      const res = await fetch("http://localhost:3000/api/custom-fields?object=customer");
      if (!res.ok) return;
      const fields = await res.json();
      renderCustomFields(fields);
    } catch {
      // Silently fail - custom fields are optional
    }
  }

  function renderCustomFields(fields) {
    const container = document.getElementById("crm-custom-fields-container");
    container.innerHTML = "";
    if (!fields || fields.length === 0) return;

    const title = document.createElement("div");
    title.className = "crm-col-title";
    title.style.marginTop = "8px";
    title.textContent = "🔧 Custom Fields";
    container.appendChild(title);

    fields.forEach(field => {
      const group = document.createElement("div");
      group.className = "crm-form-group";

      const label = document.createElement("span");
      label.className = "crm-form-label";
      label.textContent = field.name;

      let input;
      if (field.field_type === "BOOLEAN") {
        input = document.createElement("select");
        input.className = "crm-form-input";
        input.innerHTML = `<option value="">--</option><option value="true">Yes</option><option value="false">No</option>`;
      } else if (field.field_type === "NUMBER") {
        input = document.createElement("input");
        input.type = "number";
        input.className = "crm-form-input";
      } else {
        input = document.createElement("input");
        input.type = "text";
        input.className = "crm-form-input";
      }
      input.id = "crm-custom-" + field.id;
      input.dataset.fieldId = field.id;
      input.dataset.fieldType = field.field_type;

      group.appendChild(label);
      group.appendChild(input);
      container.appendChild(group);
    });
  }

  async function loadCustomFieldValues(customerId) {
    try {
      const res = await fetch(`http://localhost:3000/api/custom-field-values?record_id=${customerId}`);
      if (!res.ok) return;
      const values = await res.json();
      values.forEach(v => {
        const input = document.getElementById("crm-custom-" + v.custom_field_id);
        if (input) {
          if (v.value_number !== 0) input.value = v.value_number;
          else input.value = v.value_string || "";
        }
      });
    } catch {
      // Silently fail
    }
  }

  function collectCustomFieldValues() {
    const container = document.getElementById("crm-custom-fields-container");
    const inputs = container.querySelectorAll("[data-field-id]");
    const result = {};
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) {
        result[input.dataset.fieldId] = {
          field_type: input.dataset.fieldType,
          value: val
        };
      }
    });
    return result;
  }

  // --- STEP 1: SEND TO AI ---
  document.getElementById("crm-analyze-btn").addEventListener("click", async () => {
    if (!accumulatedMessages.length) return;

    const chatContent = JSON.stringify(accumulatedMessages);
    const btn = document.getElementById("crm-analyze-btn");
    btn.textContent = "Extracting AI data...";
    btn.disabled = true;

    try {
      const res = await fetch("http://localhost:8787", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatContent }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Worker HTTP error ${res.status}: ${errText}`);
      }
      
      const aiResult = await res.json();
      
      // Auto Populate Form (Left Column - Profile)
      document.getElementById("crm-form-name").value = (aiResult.customer_name === "null" || !aiResult.customer_name) ? "" : aiResult.customer_name;
      document.getElementById("crm-form-phone").value = (aiResult.customer_phone === "null" || !aiResult.customer_phone) ? "" : aiResult.customer_phone.replace(/\\D/g, '');
      document.getElementById("crm-form-email").value = (aiResult.customer_email === "null" || !aiResult.customer_email) ? "" : aiResult.customer_email;
      document.getElementById("crm-form-address").value = (aiResult.customer_address === "null" || !aiResult.customer_address) ? "" : aiResult.customer_address;
      document.getElementById("crm-form-company").value = (aiResult.company === "null" || !aiResult.company) ? "" : aiResult.company;
      document.getElementById("crm-form-job").value = (aiResult.job_title === "null" || !aiResult.job_title) ? "" : aiResult.job_title;
      
      const channelStr = getCurrentChannel();
      document.getElementById("crm-form-source").value = (aiResult.source === "null" || !aiResult.source) ? channelStr : aiResult.source;
      
      // Auto Populate Form (Right Column - Context)
      document.getElementById("crm-form-intent").value = aiResult.intent || "";
      document.getElementById("crm-form-pain").value = (aiResult.pain_points === "null" || !aiResult.pain_points) ? "" : aiResult.pain_points;
      document.getElementById("crm-form-budget").value = aiResult.budget || 0;
      document.getElementById("crm-form-score").value = aiResult.sales_score || 5;
      document.getElementById("crm-form-summary").value = aiResult.ai_summary || "";
      
      const sentVal = ["POSITIVE", "NEGATIVE", "NEUTRAL"].includes(aiResult.sentiment) ? aiResult.sentiment : "NEUTRAL";
      document.getElementById("crm-form-sentiment").value = sentVal;

      document.getElementById("crm-status-msg").style.display = "none";
      document.getElementById("crm-error-msg").style.display = "none";

      // Reset lead mode to "Create New"
      document.getElementById("crm-radio-new").checked = true;
      document.getElementById("crm-radio-new").dispatchEvent(new Event("change"));

      showStep(2);

      // Load custom fields for the form
      loadCustomFields();

    } catch (err) {
      alert("AI Error: " + err.message);
    } finally {
      btn.textContent = "Send to AI for analysis →";
      btn.disabled = false;
    }
  });

  document.getElementById("crm-back-1-btn").addEventListener("click", () => showStep(1));

  // --- STEP 2: SAVE TO DATABASE ---
  document.getElementById("crm-save-btn").addEventListener("click", async () => {
    let customerId = document.getElementById("crm-customer-id").value;
    const phone = document.getElementById("crm-form-phone").value.trim();
    const name = document.getElementById("crm-form-name").value.trim() || "Unnamed Customer";
    const leadMode = document.querySelector('input[name="crm-lead-mode"]:checked').value;

    const btn = document.getElementById("crm-save-btn");
    btn.textContent = "Saving to system...";
    btn.disabled = true;
    document.getElementById("crm-error-msg").style.display = "none";

    // Collect additional fields
    const email = document.getElementById("crm-form-email").value.trim();
    const address = document.getElementById("crm-form-address").value.trim();
    const company = document.getElementById("crm-form-company").value.trim();
    const jobTitle = document.getElementById("crm-form-job").value.trim();
    const source = (document.getElementById("crm-form-source").value.trim()) || getCurrentChannel();
    const painPoints = document.getElementById("crm-form-pain").value.trim();
    const intent = document.getElementById("crm-form-intent").value.trim();
    const budget = parseInt(document.getElementById("crm-form-budget").value) || 0;
    const customFields = collectCustomFieldValues();

    try {
      // 1. If new lead -> Call API to create customer
      if (leadMode === "new" && !customerId) {
        if (!phone) throw new Error("Please enter a phone number to create a new Lead!");
        const leadRes = await fetch("http://localhost:3000/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name, 
            phone,
            email,
            address,
            job_title: jobTitle,
            company,
            source,
            intent,
            budget
          })
        });
        if (!leadRes.ok) throw new Error("Cannot create Lead (" + leadRes.status + ")");
        const newLead = await leadRes.json();
        customerId = newLead.id;
      }

      if (!customerId) throw new Error("No customer selected. Please select an existing lead or create a new one.");

      // 2. Send conversation data to Backend Interactions
      const channel = getCurrentChannel();
      const rawContent = accumulatedMessages.map((m) => `${m.role === "sales" ? "Sales" : "Customer"}: ${m.text}`).join("\\n");
      
      const dbRes = await fetch("http://localhost:3000/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          channel: channel,
          raw_content: rawContent,
          ai_summary: document.getElementById("crm-form-summary").value,
          sentiment: document.getElementById("crm-form-sentiment").value,
          sales_score: parseInt(document.getElementById("crm-form-score").value) || 0,
          // Pass full rich data for Upsert via Interaction Controller
          email: email,
          address: address,
          job_title: jobTitle,
          company: company,
          source: source,
          pain_points: painPoints,
          intent: intent,
          budget: budget,
          custom_fields: customFields
        }),
      });
      
      if (!dbRes.ok) throw new Error("Save chat error " + dbRes.status);
      
      const sEl = document.getElementById("crm-status-msg");
      sEl.textContent = "✅ Saved Lead and Conversation successfully!";
      sEl.style.display = "block";
      
      setTimeout(() => {
        closeModal();
        accumulatedMessages = [];
        updateCartBadge();
      }, 1500);
      
    } catch (err) {
      const errEl = document.getElementById("crm-error-msg");
      errEl.textContent = "Error: " + err.message;
      errEl.style.display = "block";
    } finally {
      btn.textContent = customerId ? "Update Customer & Save Chat ✓" : "Create New Lead & Save ✓";
      btn.disabled = false;
    }
  });

})();
