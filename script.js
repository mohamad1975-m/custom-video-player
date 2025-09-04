async function startDownload() {
  const url = document.getElementById("m3u8").value.trim();
  if (!url) {
    alert("لطفاً لینک m3u8 را وارد کنید");
    return;
  }

  document.getElementById("status").innerText = "در حال آماده‌سازی...";

  const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    document.getElementById("status").innerText = "خطا در دانلود!";
    return;
  }

  // گرفتن فایل MP4 به صورت Blob
  const blob = await response.blob();
  const a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = "video.mp4";
  a.click();

  document.getElementById("status").innerText = "دانلود شروع شد ✅";
}
