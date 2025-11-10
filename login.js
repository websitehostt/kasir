// Dijalankan saat halaman login dimuat
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorAlert = document.getElementById("errorAlert");

  // === [PENTING] TENTUKAN USERNAME & PASSWORD DI SINI ===
  const HARDCODED_USER = "admin";
  const HARDCODED_PASS = "123";
  // =======================================================

  // 1. Cek dulu, kalau sudah login, langsung lempar ke index.html
  if (localStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "index.html";
  }

  // 2. Tambahkan event listener untuk form
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Mencegah form terkirim
    
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === HARDCODED_USER && password === HARDCODED_PASS) {
      // Jika BERHASIL
      // 1. Simpan "token" login di localStorage
      localStorage.setItem("isLoggedIn", "true");
      // 2. Arahkan ke halaman kasir
      window.location.href = "index.html";
      
    } else {
      // Jika GAGAL
      // 1. Tampilkan pesan error
      errorAlert.classList.remove("d-none");
      // 2. Kosongkan field password
      passwordInput.value = "";
    }
  });
});