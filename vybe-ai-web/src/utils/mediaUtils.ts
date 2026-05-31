/**
 * Trim + merge audio into a video blob URL.
 * Works with any video URL (data URL, blob URL, http URL).
 * Returns a new blob URL with the audio baked in.
 */
export async function mergeAudioIntoVideo(
  videoUrl: string,
  audioDataUrl: string,
  trimStart: number,
  trimEnd: number
): Promise<string> {
  const audioCtx = new AudioContext();

  // 1. Decode full audio
  const audioResp = await fetch(audioDataUrl);
  const audioArrBuf = await audioResp.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(audioArrBuf);

  // 2. Slice to selected region
  const sr = audioBuffer.sampleRate;
  const startSample = Math.floor(trimStart * sr);
  const endSample = Math.min(Math.floor(trimEnd * sr), audioBuffer.length);
  const trimmedLength = Math.max(1, endSample - startSample);

  const trimmedBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    trimmedLength,
    sr
  );
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    trimmedBuffer.copyToChannel(
      audioBuffer.getChannelData(ch).subarray(startSample, endSample),
      ch
    );
  }

  // 3. Load video element
  const video = document.createElement("video");
  video.src = videoUrl;
  video.muted = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";

  await new Promise<void>((res, rej) => {
    video.onloadedmetadata = () => res();
    video.onerror = () => rej(new Error("No se pudo cargar el video para mezcla de audio"));
    setTimeout(() => rej(new Error("Timeout al cargar video")), 15_000);
  });

  const W = video.videoWidth || 720;
  const H = video.videoHeight || 1280;

  // 4. Canvas for frame capture
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 5. Audio routing
  const dest = audioCtx.createMediaStreamDestination();
  const source = audioCtx.createBufferSource();
  source.buffer = trimmedBuffer;
  source.connect(dest);

  // 6. Combine canvas stream + audio tracks
  const FPS = 30;
  const combinedStream = canvas.captureStream(FPS);
  dest.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 5_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // 7. Record — draw frames with rAF
  recorder.start(100);
  source.start();

  await new Promise<void>((resolve) => {
    let rafId: number;
    const maxDuration = (video.duration || (trimEnd - trimStart) || 30) * 1000 + 2000;
    const timeout = setTimeout(() => {
      cancelAnimationFrame(rafId);
      resolve();
    }, maxDuration);

    const drawLoop = () => {
      ctx.drawImage(video, 0, 0, W, H);
      rafId = requestAnimationFrame(drawLoop);
    };

    video.onended = () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
      resolve();
    };

    video.play().then(() => {
      rafId = requestAnimationFrame(drawLoop);
    }).catch(() => {
      clearTimeout(timeout);
      resolve();
    });
  });

  recorder.stop();
  video.pause();
  await new Promise<void>((res) => { recorder.onstop = () => res(); });
  await audioCtx.close();

  return URL.createObjectURL(new Blob(chunks, { type: mimeType }));
}

/**
 * Returns a MediaStream with a trimmed audio track, ready to be injected
 * into a MediaRecorder stream (e.g., montage canvas recording).
 * Caller must call source.start() at the right time.
 */
export async function buildTrimmedAudioStream(
  audioDataUrl: string,
  trimStart: number,
  trimEnd: number
): Promise<{ stream: MediaStream; start: () => void; ctx: AudioContext }> {
  const audioCtx = new AudioContext();

  const audioResp = await fetch(audioDataUrl);
  const audioArrBuf = await audioResp.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(audioArrBuf);

  const sr = audioBuffer.sampleRate;
  const startSample = Math.floor(trimStart * sr);
  const endSample = Math.min(Math.floor(trimEnd * sr), audioBuffer.length);
  const trimmedLength = Math.max(1, endSample - startSample);

  const trimmedBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    trimmedLength,
    sr
  );
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    trimmedBuffer.copyToChannel(
      audioBuffer.getChannelData(ch).subarray(startSample, endSample),
      ch
    );
  }

  const dest = audioCtx.createMediaStreamDestination();
  const source = audioCtx.createBufferSource();
  source.buffer = trimmedBuffer;
  source.connect(dest);

  return {
    stream: dest.stream,
    start: () => source.start(),
    ctx: audioCtx,
  };
}
