(function () {
  if (document.getElementById("guerrilla-crm-fab")) return;

  // --- TRẠNG THÁI TÍCH LŨY ---
  let selectedText = "";
  let accumulatedMessages = []; // Mảng chứa các câu chat người dùng đã bóp nhặt
  let selectedCustomerId = null;

  // --- 1. Tạo FAB Toolbar (Nổi khi bôi đen) ---
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

  // --- 2. Tạo Nút Giỏ Hàng (Góc dưới phải) ---
  const cartBtn = document.createElement("button");
  cartBtn.id = "guerrilla-crm-cart";
  cartBtn.style.display = "none"; // Ẩn khi chưa có tin nhắn nào
  cartBtn.innerHTML = `
    <span>Analyze CRM</span>
    <span id="crm-cart-badge">0</span>
  `;
  document.body.appendChild(cartBtn);

  // --- 3. Tạo Modal Chính (Review) ---
  const backdrop = document.createElement("div");
  backdrop.id = "guerrilla-crm-modal-backdrop";
  document.body.appendChild(backdrop);

  const modal = document.createElement("div");
  modal.id = "guerrilla-crm-modal";
  modal.innerHTML = `
    <h3>Review Conversation <span id="crm-modal-close">&times;</span></h3>

    <!-- Bước 1: Duyệt nội dung chữ đã nhặt -->
    <div id="crm-step-1" class="crm-step active">
      <span class="crm-label">Temporarily saved messages</span>
      <div id="crm-msg-list" class="crm-msg-list"></div>
      
      <button id="crm-analyze-btn" class="crm-btn">Send to AI for analysis →</button>
    </div>

    <!-- Bước 2: AI Result & Auto Create Lead (2-Column Form) -->
    <div id="crm-step-2" class="crm-step">
      <div class="crm-form-grid">
        <!-- CỘT TRÁI: HỒ SƠ KHÁCH HÀNG -->
        <div class="crm-form-col">
          <div class="crm-col-title">👤 Profile Info</div>
          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Customer Name</span>
              <input type="text" id="crm-form-name" class="crm-form-input" placeholder="Nguyễn Văn A" />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Phone Number</span>
              <input type="text" id="crm-form-phone" class="crm-form-input" placeholder="09xxxx" />
              <span id="crm-lookup-msg" class="crm-lookup-status"></span>
            </div>
          </div>
          <div class="crm-form-group">
            <span class="crm-form-label">Company Name</span>
            <input type="text" id="crm-form-company" class="crm-form-input" placeholder="Công ty ABC..." />
          </div>
          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Job Title</span>
              <input type="text" id="crm-form-job" class="crm-form-input" placeholder="Giám đốc..." />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Nguồn (Source)</span>
              <input type="text" id="crm-form-source" class="crm-form-input" placeholder="Zalo, FB..." />
            </div>
          </div>
          <div class="crm-form-group">
            <span class="crm-form-label">Address</span>
            <input type="text" id="crm-form-address" class="crm-form-input" placeholder="Số nhà, đường..." />
          </div>
          <div class="crm-form-group" style="margin-bottom:0">
            <span class="crm-form-label">Email</span>
            <input type="email" id="crm-form-email" class="crm-form-input" placeholder="Email khách hàng" />
          </div>
        </div>

        <!-- CỘT PHẢI: CONTEXT BÁN HÀNG -->
        <div class="crm-form-col">
          <div class="crm-col-title">💼 Sales Context</div>
          
          <input type="hidden" id="crm-customer-id" />

          <div class="crm-form-group">
            <span class="crm-form-label">Nhu cầu (Intent)</span>
            <input type="text" id="crm-form-intent" class="crm-form-input" />
          </div>

          <div class="crm-form-group">
            <span class="crm-form-label">Nỗi Đau (Pain Points)</span>
            <input type="text" id="crm-form-pain" class="crm-form-input" placeholder="Khó khăn khách đang gặp..." />
          </div>

          <div class="crm-form-row">
            <div class="crm-form-group">
              <span class="crm-form-label">Budget</span>
              <input type="number" id="crm-form-budget" class="crm-form-input" />
            </div>
            <div class="crm-form-group">
              <span class="crm-form-label">Điểm (1-10)</span>
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
        </div>
      </div> <!-- End Grid -->

      <button id="crm-save-btn" class="crm-btn-success">Save to Database ✓</button>
      <button id="crm-back-1-btn" class="crm-btn-secondary">← Back to review messages</button>
      
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

  // --- EVENT: HIỆN THÙNG ĐỒ NGHỀ KHI BÔI ĐEN ---
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

  // --- RENDERING CHAT TRONG MODAL ---
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

  async function searchCustomers(phone) {
    const url = `http://localhost:3000/api/customers${phone ? "?phone=" + encodeURIComponent(phone) : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error: " + res.status);
    return await res.json();
  }

  // Auto trigger lookup when typing phone manually:
  document.getElementById("crm-form-phone").addEventListener("change", async (e) => {
    checkCustomerPhone(e.target.value);
  });

  async function checkCustomerPhone(phoneVal) {
    const msgEl = document.getElementById("crm-lookup-msg");
    const idEl = document.getElementById("crm-customer-id");
    const btnSave = document.getElementById("crm-save-btn");

    if (!phoneVal || phoneVal.length < 8) {
      msgEl.className = "crm-lookup-status new";
      msgEl.textContent = "Customer lạ (Sẽ tạo Lead mới)";
      idEl.value = "";
      btnSave.textContent = "Create New Lead & Save ✓";
      return;
    }
    
    msgEl.textContent = "Looking up...";
    msgEl.className = "crm-lookup-status";
    
    try {
      const customers = await searchCustomers(phoneVal);
      // Filter Exact Match
      const exactMatch = customers.find(c => c.phone.replace(/\\D/g, '') === phoneVal.replace(/\\D/g, ''));
      
      if (exactMatch) {
        msgEl.className = "crm-lookup-status existing";
        msgEl.textContent = `Customer cũ: ${exactMatch.name} (Có sẵn trong CRM)`;
        idEl.value = exactMatch.id;
        btnSave.textContent = "Update Customer & Save Chat ✓";
      } else {
        msgEl.className = "crm-lookup-status new";
        msgEl.textContent = "SĐT chưa có (Sẽ tạo Lead mới)";
        idEl.value = "";
        btnSave.textContent = "Create New Lead & Save ✓";
      }
    } catch {
      msgEl.className = "crm-lookup-status new";
      msgEl.textContent = "Không thể tra cứu CRM (Sẽ thử tạo mới)";
      idEl.value = "";
      btnSave.textContent = "Create New Lead & Save ✓";
    }
  }

  // --- STEP 1: GỬI AI ---
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
        throw new Error(`Worker lỗi HTTP ${res.status}: ${errText}`);
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
      showStep(2);

      // Trigger auto lookup based on extracted phone
      checkCustomerPhone(document.getElementById("crm-form-phone").value);

    } catch (err) {
      alert("Lỗi AI: " + err.message);
    } finally {
      btn.textContent = "Send to AI for analysis →";
      btn.disabled = false;
    }
  });

  document.getElementById("crm-back-1-btn").addEventListener("click", () => showStep(1));

  // --- STEP 3: LƯU DATABASE ---
  document.getElementById("crm-save-btn").addEventListener("click", async () => {
    let customerId = document.getElementById("crm-customer-id").value;
    const phone = document.getElementById("crm-form-phone").value.trim();
    const name = document.getElementById("crm-form-name").value.trim() || "Unnamed Customer";

    const btn = document.getElementById("crm-save-btn");
    btn.textContent = "Saving to system...";
    btn.disabled = true;
    document.getElementById("crm-error-msg").style.display = "none";

    // Lấy các trường bổ sung
    const email = document.getElementById("crm-form-email").value.trim();
    const address = document.getElementById("crm-form-address").value.trim();
    const company = document.getElementById("crm-form-company").value.trim();
    const jobTitle = document.getElementById("crm-form-job").value.trim();
    const source = (document.getElementById("crm-form-source").value.trim()) || getCurrentChannel();
    const painPoints = document.getElementById("crm-form-pain").value.trim();
    const intent = document.getElementById("crm-form-intent").value.trim();
    const budget = parseInt(document.getElementById("crm-form-budget").value) || 0;

    try {
      // 1. Nếu là KH mới -> Gọi API Create Customer để sinh Lead
      if (!customerId) {
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

      // 2. Chuyển thông tin hội thoại tới Backend Interactions
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
          // Truyền full bộ rich data để Upsert qua Interaction Controller
          email: email,
          address: address,
          job_title: jobTitle,
          company: company,
          source: source,
          pain_points: painPoints,
          intent: intent,
          budget: budget
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
