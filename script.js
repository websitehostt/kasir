// === Auth Guard ===
if (localStorage.getItem("isLoggedIn") !== "true") {
  alert("Anda belum login!");
  window.location.href = "login.html";
}
// ==========================

// === Elemen DOM ===
const menuList = document.getElementById("menuList");
const totalHarga = document.getElementById("totalHarga");
const selesaiBtn = document.getElementById("selesaiBtn");
const resetBtn = document.getElementById("resetBtn");
const riwayatTable = document.querySelector("#riwayatTable tbody");
const searchInput = document.getElementById("searchInput");
const addMenuBtn = document.getElementById("addMenuBtn");
const toggleBtn = document.getElementById("toggleMode");
const cartItemsList = document.getElementById("cartItemsList");
const itemCount = document.getElementById("itemCount");
const manageMenuList = document.getElementById("manageMenuList");
const kategoriFilter = document.getElementById("kategoriFilter"); // [BARU]

// Modal Kuantitas
const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));
const quantityModalTitle = document.getElementById('quantityModalTitle');
const quantityModalPrice = document.getElementById('quantityModalPrice');
const quantityInput = document.getElementById('quantityInput');
const addWithQuantityBtn = document.getElementById('addWithQuantityBtn');

// Modal Pembayaran
const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
const paymentTotal = document.getElementById('paymentTotal');
const paymentInput = document.getElementById('paymentInput');
const paymentChange = document.getElementById('paymentChange');
const processPaymentBtn = document.getElementById('processPaymentBtn');

// [BARU] Modal Tambah Menu
const tambahMenuModal = new bootstrap.Modal(document.getElementById('tambahMenuModal'));
const tambahNamaInput = document.getElementById('tambahNamaInput');
const tambahHargaInput = document.getElementById('tambahHargaInput');
const tambahKategoriInput = document.getElementById('tambahKategoriInput');
const simpanTambahBtn = document.getElementById('simpanTambahBtn');

// Modal Edit Menu
const editMenuModal = new bootstrap.Modal(document.getElementById('editMenuModal'));
const editMenuModalTitle = document.getElementById('editMenuModalTitle');
const editNamaInput = document.getElementById('editNamaInput');
const editHargaInput = document.getElementById('editHargaInput');
const editKategoriInput = document.getElementById('editKategoriInput'); // [BARU]
const simpanEditBtn = document.getElementById('simpanEditBtn');

// Elemen Laporan
const totalPendapatanEl = document.getElementById('totalPendapatan');
const totalTransaksiEl = document.getElementById('totalTransaksi');
const tanggalHariIniEl = document.getElementById('tanggalHariIni');
const pendapatanHariIniEl = document.getElementById('pendapatanHariIni');
const transaksiHariIniEl = document.getElementById('transaksiHariIni');

// === Data ===
// [BARU] Definisikan Kategori
const KATEGORI_LIST = ["Makanan", "Minuman", "Snack", "Lainnya"];
let filterKategoriAktif = "Semua"; // [BARU]

// [UPDATE] Tambahkan properti 'kategori' ke data menu
let menu = JSON.parse(localStorage.getItem("menu")) || [
  { nama: "Nasi Goreng", harga: 15000, kategori: "Makanan" },
  { nama: "Mie Ayam", harga: 12000, kategori: "Makanan" },
  { nama: "Es Teh", harga: 5000, kategori: "Minuman" },
  { nama: "Ayam Geprek", harga: 18000, kategori: "Makanan" },
  { nama: "Kentang Goreng", harga: 8000, kategori: "Snack" },
  { nama: "Jus Alpukat", harga: 10000, kategori: "Minuman" },
];
let keranjang = [];
let riwayat = JSON.parse(localStorage.getItem("riwayat")) || [];
let currentMenuIndex = -1;
let currentEditIndex = -1;

// === [BARU] Fungsi Render Tombol Kategori ===
function renderKategoriButtons() {
  kategoriFilter.innerHTML = ""; // Kosongkan dulu
  
  // Buat tombol "Semua"
  let btnSemua = document.createElement("button");
  btnSemua.className = "btn btn-primary"; // Aktif by default
  btnSemua.textContent = "Semua";
  btnSemua.onclick = () => filterByKategori("Semua");
  kategoriFilter.appendChild(btnSemua);

  // Buat tombol dari KATEGORI_LIST
  KATEGORI_LIST.forEach(kategori => {
    let btn = document.createElement("button");
    btn.className = "btn btn-outline-primary"; // Non-aktif by default
    btn.textContent = kategori;
    btn.onclick = () => filterByKategori(kategori);
    kategoriFilter.appendChild(btn);
  });
}

// [BARU] Fungsi untuk Aksi Filter Kategori
function filterByKategori(kategori) {
  filterKategoriAktif = kategori;
  
  // Update tampilan tombol (mana yg aktif)
  Array.from(kategoriFilter.children).forEach(btn => {
    if (btn.textContent === kategori) {
      btn.classList.add("btn-primary");
      btn.classList.remove("btn-outline-primary");
    } else {
      btn.classList.add("btn-outline-primary");
      btn.classList.remove("btn-primary");
    }
  });

  // Render ulang menu dengan filter baru
  renderMenu(searchInput.value, filterKategoriAktif);
}

// === [UPDATE] Fungsi Render Menu (Tab Kasir) ===
function renderMenu(search = "", kategori = "Semua") {
  menuList.innerHTML = "";

  // [UPDATE] Filter 2 tahap: Kategori dulu, baru Search
  let filteredMenu = menu;
  
  // 1. Filter Kategori
  if (kategori !== "Semua") {
    filteredMenu = filteredMenu.filter(m => m.kategori === kategori);
  }
  
  // 2. Filter Search
  if (search.trim() !== "") {
    filteredMenu = filteredMenu.filter((m) =>
      m.nama.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filteredMenu.length === 0) {
    menuList.innerHTML = `<p class="text-center text-muted">Menu tidak ditemukan.</p>`;
    return;
  }
  filteredMenu.forEach((item) => {
    const originalIndex = menu.findIndex(m => m.nama === item.nama && m.harga === item.harga);
    menuList.innerHTML += `
      <div class="col-md-6 col-lg-4"> 
        <div class="card text-center h-100" onclick="bukaModalKuantitas(${originalIndex})">
          <div class="card-body">
            <h5 class="card-title">${item.nama}</h5>
            <p class="card-text text-success fw-bold">Rp ${item.harga.toLocaleString('id-ID')}</p>
            <small class="text-muted d-block mb-2">${item.kategori}</small>
            <span class="btn btn-primary w-100">
              <i class="bi bi-cart-plus-fill"></i> Tambah
            </span>
          </div>
        </div>
      </div>`;
  });
}

// === Fungsi Modal Kuantitas ===
function bukaModalKuantitas(index) {
  currentMenuIndex = index;
  const item = menu[index];
  quantityModalTitle.textContent = `Tambah ${item.nama}`;
  quantityModalPrice.textContent = `Harga: Rp ${item.harga.toLocaleString('id-ID')} / item`;
  quantityInput.value = 1;
  quantityModal.show();
}

function prosesTambahKuantitas() {
  const qty = parseInt(quantityInput.value);
  if (qty > 0 && currentMenuIndex !== -1) {
    for (let i = 0; i < qty; i++) {
      keranjang.push(menu[currentMenuIndex]);
    }
    updateKeranjang();
    quantityModal.hide();
  } else {
    alert("Jumlah tidak valid!");
  }
}

// === Fungsi Keranjang ===
function updateKeranjang() {
  const total = keranjang.reduce((sum, item) => sum + item.harga, 0);
  totalHarga.textContent = "Rp " + total.toLocaleString('id-ID');
  itemCount.textContent = keranjang.length;

  cartItemsList.innerHTML = "";
  if (keranjang.length === 0) {
    cartItemsList.innerHTML = `<p class="text-muted small p-3 text-center">Keranjang masih kosong.</p>`;
    return;
  }
  const ringkasanItem = keranjang.reduce((acc, item) => {
    acc[item.nama] = (acc[item.nama] || 0) + 1;
    return acc;
  }, {});
  for (const nama in ringkasanItem) {
    const qty = ringkasanItem[nama];
    const item = menu.find(m => m.nama === nama);
    cartItemsList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-bold">${nama}</span> (x${qty})
          <br>
          <small class="text-muted">Rp ${ (item.harga * qty).toLocaleString('id-ID') }</small>
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="hapusSatuItem('${nama}')">
          <i class="bi bi-trash-fill"></i> Hapus
        </button>
      </li>`;
  }
}

function hapusSatuItem(nama) {
  const indexToRemove = keranjang.findIndex(item => item.nama === nama);
  if (indexToRemove > -1) {
    keranjang.splice(indexToRemove, 1);
    updateKeranjang();
  }
}

// === Fungsi Transaksi (Tab Riwayat) ===
function selesaiTransaksi() {
  if (keranjang.length === 0) return;
  const waktu = new Date().toLocaleString("id-ID", { hour12: false });
  keranjang.forEach((item) => {
    riwayat.push({
      nama: item.nama,
      harga: item.harga,
      waktu: waktu,
      // [BARU] Simpan juga kategori di riwayat
      kategori: item.kategori
    });
  });
  localStorage.setItem("riwayat", JSON.stringify(riwayat));
  keranjang = [];
  updateKeranjang();
  renderRiwayat();
  renderLaporan();
}

function renderRiwayat() {
  riwayatTable.innerHTML = "";
  if (riwayat.length === 0) {
    riwayatTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada riwayat transaksi.</td></tr>`;
    return;
  }
  for (let i = riwayat.length - 1; i >= 0; i--) {
    const r = riwayat[i];
    riwayatTable.innerHTML += `
      <tr>
        <td>${r.nama}</td>
        <td>Rp ${r.harga.toLocaleString('id-ID')}</td>
        <td>${r.waktu}</td>
        <td class="text-end">
          <button class="btn btn-danger btn-sm" onclick="hapusRiwayat(${i})">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>`;
  }
}

function hapusRiwayat(index) {
  const item = riwayat[index];
  if (confirm(`Yakin ingin menghapus riwayat "${item.nama}" pada ${item.waktu}?`)) {
    riwayat.splice(index, 1);
    localStorage.setItem("riwayat", JSON.stringify(riwayat));
    renderRiwayat();
    renderLaporan();
  }
}

// === Fungsi Laporan (Tab Laporan) ===
function renderLaporan() {
  let totalPendapatan = 0;
  let totalTrx = riwayat.length;
  let pendapatanHariIni = 0;
  let transaksiHariIni = 0;
  
  const todayDateString = new Date().toLocaleDateString("id-ID");
  tanggalHariIniEl.textContent = todayDateString;

  riwayat.forEach(r => {
    totalPendapatan += r.harga;
    if (r.waktu.startsWith(todayDateString)) {
      pendapatanHariIni += r.harga;
      transaksiHariIni++;
    }
  });

  totalPendapatanEl.textContent = "Rp " + totalPendapatan.toLocaleString('id-ID');
  totalTransaksiEl.textContent = totalTrx;
  pendapatanHariIniEl.textContent = "Rp " + pendapatanHariIni.toLocaleString('id-ID');
  transaksiHariIniEl.textContent = transaksiHariIni;
}

// === Fungsi Pengaturan (Tab Pengaturan) ===

// [BARU] Fungsi Buka Modal Tambah
function bukaModalTambah() {
  tambahNamaInput.value = "";
  tambahHargaInput.value = "";
  
  // Isi dropdown kategori
  tambahKategoriInput.innerHTML = "";
  KATEGORI_LIST.forEach(k => {
    tambahKategoriInput.innerHTML += `<option value="${k}">${k}</option>`;
  });
  
  tambahMenuModal.show();
}

// [BARU] Fungsi Proses Tambah Menu (dari Modal)
function prosesTambahMenu() {
  const nama = tambahNamaInput.value;
  const harga = parseInt(tambahHargaInput.value);
  const kategori = tambahKategoriInput.value;

  if (!nama || isNaN(harga) || harga <= 0) {
    alert("Nama atau harga tidak valid.");
    return;
  }

  menu.push({ nama, harga, kategori });
  localStorage.setItem("menu", JSON.stringify(menu));
  
  renderMenu(searchInput.value, filterKategoriAktif); 
  renderPengaturan();
  tambahMenuModal.hide();
  alert(`Menu "${nama}" berhasil ditambahkan!`);
}

// [UPDATE] Render Pengaturan (nampilin kategori)
function renderPengaturan() {
  manageMenuList.innerHTML = "";
  if (menu.length === 0) {
    manageMenuList.innerHTML = `<li class="list-group-item text-muted text-center">Belum ada menu.</li>`;
    return;
  }
  menu.forEach((item, index) => {
    manageMenuList.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-bold">${item.nama}</span>
          <br>
          <small class="text-success">Rp ${item.harga.toLocaleString('id-ID')}</small>
          <small class="text-muted"> | ${item.kategori}</small>
        </div>
        <div>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="bukaModalEdit(${index})">
            <i class="bi bi-pencil-fill"></i> Edit
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="hapusMenu(${index})">
            <i class="bi bi-trash-fill"></i> Hapus
          </button>
        </div>
      </li>
    `;
  });
}

function hapusMenu(index) {
  const item = menu[index];
  if (confirm(`Yakin ingin menghapus menu "${item.nama}"?`)) {
    menu.splice(index, 1);
    localStorage.setItem("menu", JSON.stringify(menu));
    renderMenu(searchInput.value, filterKategoriAktif);
    renderPengaturan();
  }
}

// [UPDATE] Buka Modal Edit (nambahin kategori)
function bukaModalEdit(index) {
  currentEditIndex = index;
  const item = menu[index];
  
  editMenuModalTitle.textContent = `Edit "${item.nama}"`;
  editNamaInput.value = item.nama;
  editHargaInput.value = item.harga;
  
  // Isi dropdown kategori
  editKategoriInput.innerHTML = "";
  KATEGORI_LIST.forEach(k => {
    editKategoriInput.innerHTML += `<option value="${k}">${k}</option>`;
  });
  // Pilih kategori yang sesuai
  editKategoriInput.value = item.kategori;
  
  editMenuModal.show();
}

// [UPDATE] Proses Edit Menu (nambahin kategori)
function prosesEditMenu() {
  const namaBaru = editNamaInput.value;
  const hargaBaru = parseInt(editHargaInput.value);
  const kategoriBaru = editKategoriInput.value; // [BARU]

  if (!namaBaru || isNaN(hargaBaru) || hargaBaru <= 0) {
    alert("Nama atau harga tidak valid!");
    return;
  }

  if (currentEditIndex > -1) {
    menu[currentEditIndex].nama = namaBaru;
    menu[currentEditIndex].harga = hargaBaru;
    menu[currentEditIndex].kategori = kategoriBaru; // [BARU]
    
    localStorage.setItem("menu", JSON.stringify(menu));
    
    renderMenu(searchInput.value, filterKategoriAktif);
    renderPengaturan();
    editMenuModal.hide();
    currentEditIndex = -1;
  }
}

function resetData() {
  if (confirm("Yakin ingin menghapus keranjang?")) {
    keranjang = [];
    updateKeranjang();
  }
}

// === Event Listeners ===
// [UPDATE] searchInput listener
searchInput.addEventListener("input", (e) => {
  renderMenu(e.target.value, filterKategoriAktif);
});
// [UPDATE] addMenuBtn listener
addMenuBtn.addEventListener("click", bukaModalTambah);
resetBtn.addEventListener("click", resetData);
addWithQuantityBtn.addEventListener('click', prosesTambahKuantitas);
simpanEditBtn.addEventListener('click', prosesEditMenu);
simpanTambahBtn.addEventListener('click', prosesTambahMenu); // [BARU]

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', () => {
  if (confirm("Anda yakin ingin logout?")) {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  }
});

// === Logika Modal Pembayaran ===
processPaymentBtn.addEventListener('click', () => {
  const total = keranjang.reduce((sum, item) => sum + item.harga, 0);
  const bayar = parseInt(paymentInput.value) || 0;
  if (bayar < total) {
    alert("Uang pembayaran kurang!");
    return;
  }
  const kembalian = bayar - total;
  const keranjangStruk = [...keranjang];
  
  alert(`Transaksi Berhasil!`); // Disingkat biar struknya aja
  
  selesaiTransaksi(); 
  
  cetakStruk(keranjangStruk, total, bayar, kembalian);
  
  paymentModal.hide();
});

selesaiBtn.addEventListener("click", () => {
  const total = keranjang.reduce((sum, item) => sum + item.harga, 0);
  if (total === 0) {
    alert("Keranjang masih kosong!");
    return;
  }
  paymentTotal.textContent = "Rp " + total.toLocaleString('id-ID');
  paymentInput.value = "";
  paymentChange.textContent = "";
  paymentModal.show();
});

paymentInput.addEventListener('input', () => {
  const total = keranjang.reduce((sum, item) => sum + item.harga, 0);
  const bayar = parseInt(paymentInput.value) || 0;
  if (bayar >= total) {
    const kembalian = bayar - total;
    paymentChange.textContent = `Kembalian: Rp ${kembalian.toLocaleString('id-ID')}`;
    paymentChange.classList.remove('text-danger');
    paymentChange.classList.add('text-success');
    processPaymentBtn.disabled = false;
  } else {
    paymentChange.textContent = "Uang kurang";
    paymentChange.classList.add('text-danger');
    paymentChange.classList.remove('text-success');
    processPaymentBtn.disabled = true;
  }
});

// === Fungsi Cetak Struk ===
function cetakStruk(itemStruk, total, bayar, kembalian) {
  const ringkasanItem = itemStruk.reduce((acc, item) => {
    const key = `${item.nama} @ Rp ${item.harga.toLocaleString('id-ID')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  let itemHtml = "";
  for (const nama in ringkasanItem) {
    const qty = ringkasanItem[nama];
    const itemInfo = menu.find(m => nama.includes(m.nama));
    const subtotal = itemInfo ? itemInfo.harga * qty : 0;
    itemHtml += `
      <tr>
        <td colspan="2">${nama}</td>
        <td class="text-end">${qty}x</td>
        <td class="text-end">Rp ${subtotal.toLocaleString('id-ID')}</td>
      </tr>
    `;
  }
  const waktuCetak = new Date().toLocaleString("id-ID", { hour12: false });
  const strukHtml = `
    <html>
      <head><title>Struk Pembayaran</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 10px; }
          h1 { font-size: 1.2rem; text-align: center; margin: 0; }
          p { font-size: 0.8rem; margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
          th, td { padding: 4px 0; }
          .text-end { text-align: right; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Kantin Modern</h1><p class="text-center">Struk Pembayaran</p>
        <p>Waktu: ${waktuCetak}</p>
        <div class="divider"></div>
        <table><thead>
            <tr>
              <th colspan="2">Item</th>
              <th class="text-end">Qty</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemHtml}</tbody>
        </table>
        <div class="divider"></div>
        <table><tbody>
            <tr class="total-row">
              <td colspan="3">TOTAL</td>
              <td class="text-end">Rp ${total.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td colspan="3">BAYAR</td>
              <td class="text-end">Rp ${bayar.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td colspan="3">KEMBALI</td>
              <td class="text-end">Rp ${kembalian.toLocaleString('id-ID')}</td>
            </tr>
          </tbody></table>
        <div class="divider"></div>
        <p class="text-center">Terima kasih!</p>
      </body>
    </html>`;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(strukHtml);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

// === Logika Dark Mode ===
const getPreferredTheme = () => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) return storedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
const setTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    toggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    toggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  }
  localStorage.setItem('theme', theme);
};
toggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

// === Inisialisasi Aplikasi ===
function init() {
  setTheme(getPreferredTheme());
  renderKategoriButtons(); // [BARU]
  renderMenu(searchInput.value, filterKategoriAktif); // [UPDATE]
  renderRiwayat();
  renderPengaturan();
  renderLaporan();
  updateKeranjang();
}

init();