(function () {
  const input = document.getElementById('compositionInput');
  const frame = document.getElementById('previewFrame');
  const status = document.getElementById('statusText');
  const example = `<style>
body { margin:0; font-family: Inter, system-ui, sans-serif; background:#030712; color:white; overflow:hidden; }
.stage { position:relative; width:100vw; height:100vh; display:grid; place-items:center; background:radial-gradient(circle at 30% 20%, #7c3aed, transparent 26%), linear-gradient(135deg,#020617,#111827); }
.orb { position:absolute; width:34vmin; height:34vmin; border-radius:50%; filter:blur(2px); background:linear-gradient(135deg,#06b6d4,#a78bfa); animation:float 8s ease-in-out infinite; opacity:.75; }
.card { position:relative; max-width:72%; padding:6vmin; border:1px solid rgba(255,255,255,.2); border-radius:32px; background:rgba(15,23,42,.62); backdrop-filter:blur(18px); box-shadow:0 40px 120px rgba(0,0,0,.35); }
h1 { font-size:9vmin; line-height:.9; margin:0 0 3vmin; animation:rise 1s ease both; }
p { color:#cbd5e1; font-size:3vmin; margin:0; animation:rise 1s .45s ease both; }
.badge { color:#67e8f9; font-weight:800; letter-spacing:.16em; text-transform:uppercase; animation:rise 1s .15s ease both; }
@keyframes rise { from { opacity:0; transform:translateY(30px) scale(.98); } to { opacity:1; transform:none; } }
@keyframes float { 0%,100% { transform:translate(-35vmin,-12vmin) scale(1); } 50% { transform:translate(28vmin,14vmin) scale(1.25); } }
</style>
<div class="stage" data-duration="8">
  <div class="orb"></div>
  <main class="card">
    <div class="badge">FrameForge Studio</div>
    <h1>Write HTML.<br>Render video.</h1>
    <p>A free local-first composition you can edit, preview, and record from your browser.</p>
  </main>
</div>`;

  function documentFor(markup) {
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${markup}</body></html>`;
  }

  function render() {
    frame.srcdoc = documentFor(input.value);
    status.textContent = 'Preview rendered at ' + new Date().toLocaleTimeString() + '.';
  }

  async function record() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      status.textContent = 'Recording is not supported in this browser. Try Chrome or use a screen recorder.';
      return;
    }
    status.textContent = 'Choose this browser tab/window, then recording will stop after 8 seconds.';
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = event => event.data.size && chunks.push(event.data);
    recorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'frameforge-preview.webm';
      link.click();
      URL.revokeObjectURL(url);
      status.textContent = 'Recording downloaded as frameforge-preview.webm.';
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 8000);
  }

  document.getElementById('loadExample').addEventListener('click', () => { input.value = example; render(); });
  document.getElementById('renderPreview').addEventListener('click', render);
  document.getElementById('recordPreview').addEventListener('click', () => record().catch(err => { status.textContent = 'Recording cancelled or blocked: ' + err.message; }));
  input.value = example;
  render();
}());
